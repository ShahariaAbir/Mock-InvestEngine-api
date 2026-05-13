import { getSupabaseClient, Company } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Helper function to calculate random ROI
function calculateROI(volatilityFactor: number): number {
  const random = Math.random();
  let roi: number;
  
  if (random < 0.7) {
    roi = Math.random() * 8;
  } else {
    roi = -Math.random() * 5;
  }
  
  roi *= volatilityFactor;
  return parseFloat(roi.toFixed(2));
}

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
      const roi = calculateROI(company.volatility_factor);
      const capitalBefore = company.current_capital;
      const changeAmount = (capitalBefore * roi) / 100;
      const capitalAfter = capitalBefore + changeAmount;

      updates.push({
        id: company.id,
        current_capital: capitalAfter,
        last_updated: new Date().toISOString(),
      });

      logs.push({
        company_id: company.id,
        company_name: company.name,
        event_type: roi > 0 ? 'profit' : 'loss',
        roi_percentage: roi,
        capital_before: capitalBefore,
        capital_after: capitalAfter,
        change_amount: changeAmount,
        timestamp: new Date().toISOString(),
      });
    }

    // Update companies with new capital values
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('companies')
        .update({
          current_capital: update.current_capital,
          last_updated: update.last_updated,
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
          updated_at: u.last_updated,
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
