import { calculateScheduledROI } from '@/lib/market-schedule';
import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();

    console.log(`[Market Engine] Initialization triggered at ${new Date().toISOString()}`);

    // Fetch all companies
    const { data: companies, error: fetchError } = await supabase
      .from('companies')
      .select('*');

    if (fetchError || !companies) {
      console.error('Error fetching companies:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch companies', details: fetchError?.message },
        { status: 500 }
      );
    }

    // Generate initial profit/loss for each company
    const updates = [];
    const logs = [];

    for (const company of companies) {
      const scheduledResult = calculateScheduledROI(company.name, company.volatility_factor);
      const roi = scheduledResult.roi;
      const capitalBefore = company.current_capital;
      const changeAmount = (capitalBefore * roi) / 100;
      const capitalAfter = capitalBefore + changeAmount;

      let status: 'Profit' | 'Loss' | 'Stable' = 'Stable';
      if (roi > 0.5) status = 'Profit';
      else if (roi < -0.5) status = 'Loss';

      updates.push({
        id: company.id,
        current_capital: parseFloat(capitalAfter.toFixed(2)),
        status,
        roi_percentage: roi,
        last_update: new Date().toISOString(),
      });

      logs.push({
        company_id: company.id,
        company_name: company.name,
        event_type: scheduledResult.eventType,
        roi_percentage: roi,
        capital_before: capitalBefore,
        capital_after: parseFloat(capitalAfter.toFixed(2)),
        change_amount: parseFloat(changeAmount.toFixed(2)),
        timestamp: new Date().toISOString(),
      });

      console.log(
        `[Market Engine] ${company.name}: ${scheduledResult.scheduleReason}; current ${scheduledResult.gmtPlus6Time} GMT+6; generated ${scheduledResult.eventType} ROI ${roi}%`
      );
    }

    // Update companies with new capital values
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('companies')
        .update({
          current_capital: update.current_capital,
          status: update.status,
          roi_percentage: update.roi_percentage,
          last_update: update.last_update,
          updated_at: new Date().toISOString(),
        })
        .eq('id', update.id);

      if (updateError) {
        console.error('Error updating company:', updateError);
      }
    }

    // Insert market logs
    if (logs.length > 0) {
      const { error: logsError } = await supabase
        .from('market_logs')
        .insert(logs);

      if (logsError) {
        console.error('Error inserting logs:', logsError);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Market initialized with profit/loss data',
        timestamp: new Date().toISOString(),
        companies_updated: updates.length,
        logs_created: logs.length,
        updates: updates.map((u) => ({
          company_id: u.id,
          new_capital: u.current_capital,
          updated_at: u.last_update,
        })),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Market initialization error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
