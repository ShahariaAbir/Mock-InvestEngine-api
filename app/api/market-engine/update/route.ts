import { calculateScheduledROI } from '@/lib/market-schedule';
import { getSupabaseClient, Company } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // Verify this is a valid cron request from Vercel
    const authHeader = request.headers.get('authorization');
    
    // In production, you should verify the cron token
    // For now, we'll accept all POST requests but log them
    console.log(`[Market Engine] Update triggered at ${new Date().toISOString()}`);

    // Fetch all companies
    const { data: companies, error: fetchError } = await supabase
      .from('companies')
      .select('*');

    if (fetchError) {
      console.error('Error fetching companies:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch companies', details: fetchError.message },
        { status: 500 }
      );
    }

    if (!companies || companies.length === 0) {
      return NextResponse.json(
        { error: 'No companies found in database' },
        { status: 404 }
      );
    }

    const updatedCompanies: Company[] = [];
    const logsToInsert: any[] = [];

    // Process each company
    for (const company of companies as Company[]) {
      const scheduledResult = calculateScheduledROI(company.name, company.volatility_factor);
      const roi = scheduledResult.roi;
      const newCapital = company.current_capital * (1 + roi / 100);
      const changeAmount = newCapital - company.current_capital;
      
      // Determine status
      let status: 'Profit' | 'Loss' | 'Stable' = 'Stable';
      if (roi > 0.5) status = 'Profit';
      else if (roi < -0.5) status = 'Loss';

      updatedCompanies.push({
        ...company,
        current_capital: parseFloat(newCapital.toFixed(2)),
        status,
        roi_percentage: roi,
        last_update: new Date().toISOString(),
      });

      // Log this transaction
      logsToInsert.push({
        company_id: company.id,
        company_name: company.name,
        event_type: scheduledResult.eventType,
        roi_percentage: roi,
        capital_before: company.current_capital,
        capital_after: parseFloat(newCapital.toFixed(2)),
        change_amount: parseFloat(changeAmount.toFixed(2)),
        timestamp: new Date().toISOString(),
      });

      console.log(
        `[Market Engine] ${company.name}: ${scheduledResult.scheduleReason}; current ${scheduledResult.gmtPlus6Time} GMT+6; generated ${scheduledResult.eventType} ROI ${roi}%`
      );
    }

    // Update all companies in database
    const updatePromises = updatedCompanies.map((company) =>
      supabase
        .from('companies')
        .update({
          current_capital: company.current_capital,
          status: company.status,
          roi_percentage: company.roi_percentage,
          last_update: company.last_update,
          updated_at: new Date().toISOString(),
        })
        .eq('id', company.id)
    );

    // Insert market logs
    const { error: logsError } = await supabase
      .from('market_logs')
      .insert(logsToInsert);

    if (logsError) {
      console.error('Error inserting market logs:', logsError);
      // Don't fail if logs fail, just log it
    }

    // Wait for all updates to complete
    const results = await Promise.all(updatePromises);

    // Check for any errors in updates
    const updateErrors = results.filter((r) => r.error);
    if (updateErrors.length > 0) {
      console.error('Errors during company updates:', updateErrors);
      return NextResponse.json(
        {
          error: 'Some companies failed to update',
          details: updateErrors,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Market engine updated ${updatedCompanies.length} companies`,
        timestamp: new Date().toISOString(),
        companies: updatedCompanies,
        logs_inserted: logsToInsert.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Market engine error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Also allow GET requests for testing
export async function GET(request: NextRequest) {
  return POST(request);
}
