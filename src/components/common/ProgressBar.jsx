import React from 'react';

export default function ProgressBar({ current, total, category, difficulty }) {
  const percent = total > 0 ? Math.min(100, Math.round(((current + 1) / total) * 100)) : 0;

  const getDifficultyColor = () => {
    switch ((difficulty || '').toLowerCase()) {
      case 'easy':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'hard':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'medium':
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs sm:text-sm font-bold text-slate-200">
            Question {current + 1} of {total}
          </span>
          {category && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
              {category}
            </span>
          )}
        </div>

        {difficulty && (
          <span className={`text-[11px] px-2 py-0.5 rounded-full border font-semibold ${getDifficultyColor()}`}>
            {difficulty}
          </span>
        )}
      </div>

      {/* Modern Progress Track */}
      <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500 ease-out shadow-sm"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
