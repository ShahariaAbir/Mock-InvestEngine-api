import { getSupabaseClient, Company } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabase = getSupabaseClient();
    
    // Fetch all companies from Supabase
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .order('current_capital', { ascending: false });

    if (error) {
      console.error('Error fetching companies:', error);
      return NextResponse.json(
        {
          error: 'Failed to fetch market data',
          details: error.message,
        },
        { status: 500 }
      );
    }

    // Fetch market logs for each company (last 5 entries per company)
    const companiesWithLogs = await Promise.all(
      (companies || []).map(async (company) => {
        const { data: logs, error: logsError } = await supabase
          .from('market_logs')
          .select('*')
          .eq('company_id', company.id)
          .order('timestamp', { ascending: false })
          .limit(5);

        return {
          id: company.id,
          name: company.name,
          initial_capital: company.initial_capital,
          current_capital: company.current_capital,
          volatility_factor: company.volatility_factor,
          last_updated: company.last_updated,
          total_profit_loss: company.current_capital - company.initial_capital,
          roi_percentage: (((company.current_capital - company.initial_capital) / company.initial_capital) * 100).toFixed(2),
          profit_loss_history: (logs || []).map((log) => ({
            id: log.id,
            event_type: log.event_type,
            roi_percentage: log.roi_percentage,
            capital_before: log.capital_before,
            capital_after: log.capital_after,
            change_amount: log.change_amount,
            timestamp: log.timestamp,
            date: new Date(log.timestamp).toLocaleDateString('en-US'),
            time: new Date(log.timestamp).toLocaleTimeString('en-US'),
          })),
        };
      })
    );

    return NextResponse.json(
      {
        success: true,
        api_version: '2.0',
        timestamp: new Date().toISOString(),
        generated_at: {
          date: new Date().toLocaleDateString('en-US'),
          time: new Date().toLocaleTimeString('en-US'),
        },
        total_companies: companiesWithLogs.length,
        companies: companiesWithLogs,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
        },
      }
    );
  } catch (error) {
    console.error('Market data API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
