'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlayCircle, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
}

export function TestAPIButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  async function testAPI() {
    setIsLoading(true);
    setShowResult(false);

    try {
      // Test market data endpoint
      const marketDataResponse = await fetch('/api/market-data', {
        method: 'GET',
      });

      if (!marketDataResponse.ok) {
        throw new Error(`Market data API failed: ${marketDataResponse.status}`);
      }

      const marketData = await marketDataResponse.json();

      // Test market engine update endpoint
      const updateResponse = await fetch('/api/market-engine/update', {
        method: 'POST',
      });

      if (!updateResponse.ok) {
        throw new Error(`Market engine API failed: ${updateResponse.status}`);
      }

      const updateData = await updateResponse.json();

      setResult({
        success: true,
        message: 'All APIs working correctly!',
        details: {
          marketData: `${marketData.total_companies} companies loaded`,
          engineUpdate: updateData.message,
          timestamp: new Date().toISOString(),
        },
      });

      toast.success('APIs tested successfully!');
    } catch (error) {
      console.error('API test error:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
      });

      toast.error('API test failed');
    } finally {
      setIsLoading(false);
      setShowResult(true);
    }
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={testAPI}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Testing APIs...
          </>
        ) : (
          <>
            <PlayCircle className="w-4 h-4 mr-2" />
            Test Market APIs
          </>
        )}
      </Button>

      {showResult && result && (
        <div
          className={`p-4 rounded-lg border ${
            result.success
              ? 'bg-green-900/20 border-green-700/50'
              : 'bg-red-900/20 border-red-700/50'
          }`}
        >
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`font-semibold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                {result.message}
              </p>
              {result.details && (
                <pre className="mt-2 text-xs bg-slate-900/50 p-2 rounded overflow-auto text-slate-300">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
