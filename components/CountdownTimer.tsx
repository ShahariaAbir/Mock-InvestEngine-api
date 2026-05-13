'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<string>('1:00');
  const [progress, setProgress] = useState<number>(100);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const nextMinute = new Date(now.getTime() + 5 * 60 * 1000);
      nextMinute.setSeconds(0);
      nextMinute.setMilliseconds(0);

      // Find next 5-minute mark
      const minutes = nextMinute.getMinutes();
      const nextFiveMinute = Math.ceil(minutes / 5) * 5;
      nextMinute.setMinutes(nextFiveMinute);

      const diff = nextMinute.getTime() - now.getTime();
      const seconds = Math.floor((diff / 1000) % 60);
      const mins = Math.floor((diff / 1000 / 60) % 60);

      const totalSeconds = mins * 60 + seconds;
      const totalSecondsIn5Min =1 * 60;
      const progressPercent = (totalSeconds / totalSecondsIn5Min) * 100;

      setProgress(Math.max(0, progressPercent));
      setTimeLeft(`${mins}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="w-5 h-5 text-blue-400" />
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Next Market Update
        </h3>
      </div>
      <p className="text-4xl font-bold text-white mb-4 font-mono">{timeLeft}</p>
      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-slate-500 mt-3">
        Market updates every 5 minutes (adjustable in cron config)
      </p>
    </div>
  );
}
