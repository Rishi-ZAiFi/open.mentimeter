import React from 'react';
import { Trophy, ArrowUp, ArrowDown, Minus, Medal, Sparkles } from 'lucide-react';

export default function TrainerLeaderboard({ leaderboard = [], onClose }) {
  const top10 = leaderboard.slice(0, 10);

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold text-sm shadow-md shadow-amber-500/10">
            🥇
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 rounded-xl bg-slate-300/20 border border-slate-300/40 text-slate-200 flex items-center justify-center font-bold text-sm">
            🥈
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-700/20 border border-amber-700/40 text-amber-600 flex items-center justify-center font-bold text-sm">
            🥉
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center font-mono font-bold text-xs">
            {rank}
          </div>
        );
    }
  };

  const getDeltaBadge = (delta) => {
    if (delta > 0) {
      return (
        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-400 font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
          <ArrowUp className="w-3 h-3" />
          +{delta}
        </span>
      );
    }
    if (delta < 0) {
      return (
        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-rose-400 font-mono px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
          <ArrowDown className="w-3 h-3" />
          {delta}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-xs font-medium text-slate-400 font-mono px-1.5 py-0.5">
        <Minus className="w-3 h-3 text-slate-400" />
      </span>
    );
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Leaderboard</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase tracking-wider">
                Top 10
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Live corporate ranking and score movements
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            Back to Question
          </button>
        )}
      </div>

      {/* Leaderboard List */}
      {top10.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs">
          No participant scores recorded yet.
        </div>
      ) : (
        <div className="space-y-2.5">
          {top10.map((p, idx) => {
            const rank = p.currentRank || (idx + 1);
            const isTop3 = rank <= 3;

            return (
              <div
                key={p.id || idx}
                className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 transform hover:scale-[1.01] ${
                  isTop3
                    ? 'bg-slate-950/90 border-slate-700/80 shadow-md'
                    : 'bg-slate-950/50 border-slate-800/60'
                }`}
              >
                {/* Left: Rank & Participant Name */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  {getRankBadge(rank)}
                  
                  <div className="flex items-center gap-2.5 min-w-0 truncate">
                    <span className="font-bold text-sm sm:text-base text-white truncate">
                      {p.name}
                    </span>
                    {rank === 1 && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Leader
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Movement Indicator & Score */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  {getDeltaBadge(p.rankDelta || 0)}

                  <div className="text-right min-w-[70px]">
                    <span className="font-mono text-base sm:text-lg font-black text-blue-400">
                      {(p.score || 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block -mt-1 font-sans">
                      pts
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
