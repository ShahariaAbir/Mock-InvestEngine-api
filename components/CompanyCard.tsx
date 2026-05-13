'use client';

import { Company } from '@/lib/supabase/client';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface CompanyCardProps {
  company: Company;
}

export function CompanyCard({ company }: CompanyCardProps) {
  const capitalChangePercent = ((company.current_capital - company.initial_capital) / company.initial_capital) * 100;
  const isProfit = capitalChangePercent > 0;
  const isLoss = capitalChangePercent < 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 hover:border-slate-600 transition-all p-6 h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">{company.name}</h3>
          <p className="text-sm text-slate-400 mt-1">
            Volatility: {company.volatility_factor.toFixed(2)}x
          </p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            company.status === 'Profit'
              ? 'bg-green-900/50 text-green-400 border border-green-700'
              : company.status === 'Loss'
              ? 'bg-red-900/50 text-red-400 border border-red-700'
              : 'bg-slate-700/50 text-slate-300 border border-slate-600'
          }`}
        >
          {company.status}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
            Current Capital
          </p>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(company.current_capital)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
              Total Return
            </p>
            <div className="flex items-center gap-2">
              {isProfit && <TrendingUp className="w-4 h-4 text-green-400" />}
              {isLoss && <TrendingDown className="w-4 h-4 text-red-400" />}
              {!isProfit && !isLoss && <Minus className="w-4 h-4 text-slate-400" />}
              <p
                className={`text-lg font-bold ${
                  isProfit
                    ? 'text-green-400'
                    : isLoss
                    ? 'text-red-400'
                    : 'text-slate-300'
                }`}
              >
                {isProfit ? '+' : ''}{capitalChangePercent.toFixed(2)}%
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
              Latest ROI
            </p>
            <p
              className={`text-lg font-bold ${
                company.roi_percentage > 0
                  ? 'text-green-400'
                  : company.roi_percentage < 0
                  ? 'text-red-400'
                  : 'text-slate-300'
              }`}
            >
              {company.roi_percentage > 0 ? '+' : ''}{company.roi_percentage.toFixed(2)}%
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-700">
          <p className="text-xs text-slate-500">
            Updated: {new Date(company.last_update).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </Card>
  );
}
