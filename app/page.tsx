'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient, Company } from '@/lib/supabase/client';
import { CompanyCard } from '@/components/CompanyCard';
import { CountdownTimer } from '@/components/CountdownTimer';
import { MarketLogs } from '@/components/MarketLogs';
import { TestAPIButton } from '@/components/TestAPIButton';
import { AlertCircle, RefreshCw, TrendingUp } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function Dashboard() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalValue, setTotalValue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);

  useEffect(() => {
    // Initialize market data on first load
    initializeMarket();
    
    // Fetch companies after initialization
    fetchCompanies();
    
    // Set up refresh interval every 10 seconds
    const interval = setInterval(fetchCompanies, 10000);

    return () => clearInterval(interval);
  }, []);

  async function initializeMarket() {
    try {
      console.log('[Dashboard] Initializing market data...');
      const response = await fetch('/api/market-engine/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[Dashboard] Market initialized:', data);
      } else {
        console.log('[Dashboard] Market already initialized or initialization skipped');
      }
    } catch (err) {
      console.error('[Dashboard] Initialization error:', err);
    }
  }

  async function fetchCompanies() {
    try {
      setError(null);
      const supabase = getSupabaseClient();
      const { data, error: supabaseError } = await supabase
        .from('companies')
        .select('*')
        .order('current_capital', { ascending: false });

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        setError('Unable to load market data. Check your Supabase connection.');
        return;
      }

      if (!data || data.length === 0) {
        setError('No companies found. Run the SQL setup files in your Supabase database.');
        setLoading(false);
        return;
      }

      setCompanies(data as Company[]);

      // Calculate totals
      const total = (data as Company[]).reduce((sum, company) => sum + company.current_capital, 0);
      const profit = (data as Company[]).reduce(
        (sum, company) => sum + (company.current_capital - company.initial_capital),
        0
      );

      setTotalValue(total);
      setTotalProfit(profit);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setError('Error loading market data');
      setLoading(false);
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalProfitPercent =
    companies.length > 0
      ? ((totalProfit / companies.reduce((sum, c) => sum + c.initial_capital, 0)) * 100)
      : 0;

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Market Engine</h1>
                <p className="text-sm text-slate-400">Live Investment Dashboard</p>
              </div>
            </div>
            <button
              onClick={fetchCompanies}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Summary */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-6">
              <p className="text-sm text-slate-400 uppercase tracking-wider mb-2">
                Total Portfolio Value
              </p>
              <p className="text-3xl font-bold text-white">{formatCurrency(totalValue)}</p>
              <p className="text-xs text-slate-500 mt-2">
                {companies.length} companies tracked
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-6">
              <p className="text-sm text-slate-400 uppercase tracking-wider mb-2">
                Total Return
              </p>
              <p
                className={`text-3xl font-bold ${
                  totalProfit > 0 ? 'text-green-400' : totalProfit < 0 ? 'text-red-400' : 'text-slate-300'
                }`}
              >
                {formatCurrency(totalProfit)}
              </p>
              <p
                className={`text-xs mt-2 ${
                  totalProfitPercent > 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {totalProfitPercent > 0 ? '+' : ''}{totalProfitPercent.toFixed(2)}%
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-6">
              <p className="text-sm text-slate-400 uppercase tracking-wider mb-2">
                Active Positions
              </p>
              <p className="text-3xl font-bold text-white">{companies.length}</p>
              <p className="text-xs text-slate-500 mt-2">
                {companies.filter((c) => c.status === 'Profit').length} profitable
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 rounded-lg bg-red-900/20 border border-red-700/50 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-semibold">Configuration Required</p>
              <p className="text-red-300/80 text-sm mt-1">{error}</p>
              <p className="text-red-300/60 text-xs mt-2">
                Follow these steps:
                <br />
                1. Copy your Supabase URL and Anon Key to .env.local
                <br />
                2. Execute the SQL files in /sql folder in your Supabase dashboard
                <br />
                3. Click refresh button above
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-400">Loading market data...</p>
          </div>
        )}

        {/* Two Column Layout */}
        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Companies Grid */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-white mb-6">Companies</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {companies.map((company) => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <CountdownTimer />
              <Separator className="bg-slate-700" />
              <TestAPIButton />
              <Separator className="bg-slate-700" />
              <MarketLogs />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-16 py-8 text-center text-slate-500 text-sm">
        <p>Market Engine Dashboard | Real-time Investment Tracking</p>
        <p className="mt-2">
          API Endpoints: /api/market-data | /api/market-engine/update
        </p>
      </footer>
    </main>
  );
}
