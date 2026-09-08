import React from 'react';
import { Timer, Clock } from 'lucide-react';

export default function TimerDisplay({ timeRemaining, totalDuration, size = 'default' }) {
  if (totalDuration <= 0) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-400 font-mono">
        <Clock className="w-3.5 h-3.5" />
        <span>Untimed</span>
      </div>
    );
  }

  const percent = Math.max(0, Math.min(100, (timeRemaining / totalDuration) * 100));
  const isUrgent = timeRemaining <= 5 && timeRemaining > 0;
  const isCritical = timeRemaining <= 0;

  // Ring circumference calculations
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  let colorClass = 'text-emerald-400 stroke-emerald-500';
  let bgClass = 'bg-emerald-500/10 border-emerald-500/30';

  if (timeRemaining <= 10 && timeRemaining > 5) {
    colorClass = 'text-amber-400 stroke-amber-500';
    bgClass = 'bg-amber-500/10 border-amber-500/30';
  } else if (timeRemaining <= 5) {
    colorClass = 'text-rose-400 stroke-rose-500';
    bgClass = 'bg-rose-500/15 border-rose-500/40 animate-pulse';
  }

  if (size === 'large') {
    return (
      <div className={`relative flex items-center justify-center p-3 rounded-2xl border ${bgClass} transition-all`}>
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 52 52">
            {/* Background circle */}
            <circle
              cx="26"
              cy="26"
              r={radius}
              className="stroke-slate-800"
              strokeWidth="4"
              fill="transparent"
            />
            {/* Countdown progress circle */}
            <circle
              cx="26"
              cy="26"
              r={radius}
              className={`${colorClass} transition-all duration-1000 ease-linear`}
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className={`font-mono text-xl font-extrabold ${colorClass.split(' ')[0]}`}>
              {Math.max(0, timeRemaining)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border ${bgClass} transition-all`}>
      <Timer className={`w-4 h-4 ${colorClass.split(' ')[0]} ${isUrgent ? 'animate-spin' : ''}`} />
      <span className={`font-mono text-sm font-black tracking-wider ${colorClass.split(' ')[0]}`}>
        {Math.max(0, timeRemaining)}s
      </span>
    </div>
  );
}
