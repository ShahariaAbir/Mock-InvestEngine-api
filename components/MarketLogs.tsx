'use client';

import { useEffect, useState } from 'react';
import { MarketLog, getSupabaseClient } from '@/lib/supabase/client';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function MarketLogs() {
  const [logs, setLogs] = useState<MarketLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  async function fetchLogs() {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('market_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching logs:', error);
        return;
      }

      setLogs(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
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

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-6">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        Market Logs
      </h3>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {loading ? (
          <p className="text-slate-400 text-sm">Loading market logs...</p>
        ) : logs.length === 0 ? (
          <p className="text-slate-400 text-sm">No transactions yet</p>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                {log.event_type === 'profit' ? (
                  <TrendingUp className="w-4 h-4 text-green-400 flex-shrink-0" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {log.company_name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <p
                  className={`text-sm font-bold ${
                    log.event_type === 'profit'
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}
                >
                  {log.event_type === 'profit' ? '+' : '-'}
                  {Math.abs(log.change_amount > 0 ? log.change_amount : log.roi_percentage).toFixed(2)}
                  {log.roi_percentage ? '%' : ''}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
