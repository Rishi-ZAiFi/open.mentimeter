import React from 'react';
import { CheckCircle2, XCircle, Users, Check, Lightbulb } from 'lucide-react';

export default function TrainerDistribution({ revealData, currentQuestion }) {
  if (!revealData) return null;

  const {
    correctAnswer,
    explanation,
    optionDist = [],
    answeredCount = 0,
    notAnsweredCount = 0,
    correctCount = 0,
    accuracyPct = 0
  } = revealData;

  const optionLetters = ['A', 'B', 'C', 'D'];
  const optionColors = [
    { bg: 'bg-blue-600', border: 'border-blue-500/40', fill: 'bg-blue-500', text: 'text-blue-400' },
    { bg: 'bg-emerald-600', border: 'border-emerald-500/40', fill: 'bg-emerald-500', text: 'text-emerald-400' },
    { bg: 'bg-amber-600', border: 'border-amber-500/40', fill: 'bg-amber-500', text: 'text-amber-400' },
    { bg: 'bg-rose-600', border: 'border-rose-500/40', fill: 'bg-rose-500', text: 'text-rose-400' }
  ];

  return (
    <div className="w-full space-y-6 animate-fade-in">
      
      {/* Response Distribution Bars */}
      <div className="space-y-3">
        {currentQuestion?.options?.map((optText, idx) => {
          const isCorrect = idx === correctAnswer;
          const dist = optionDist[idx] || { count: 0, pct: 0 };
          const color = optionColors[idx % optionColors.length];

          return (
            <div
              key={idx}
              className={`relative overflow-hidden rounded-2xl border p-4 transition-all duration-500 ${
                isCorrect
                  ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-900/20'
                  : 'bg-slate-900/90 border-slate-800'
              }`}
            >
              {/* Background Animated Progress Fill */}
              <div
                className={`absolute top-0 bottom-0 left-0 ${isCorrect ? 'bg-emerald-500/20' : 'bg-slate-800/60'} transition-all duration-1000 ease-out`}
                style={{ width: `${dist.pct}%` }}
              />

              <div className="relative z-10 flex items-center justify-between gap-4">
                
                {/* Option Letter & Text */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0 ${
                      isCorrect ? 'bg-emerald-500 text-white' : `${color.bg} text-white`
                    }`}
                  >
                    {optionLetters[idx]}
                  </div>
                  <span className={`text-sm sm:text-base font-medium truncate ${isCorrect ? 'text-emerald-100 font-bold' : 'text-slate-200'}`}>
                    {optText}
                  </span>
                </div>

                {/* Percentage & Count Breakdown */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {isCorrect && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Check className="w-3.5 h-3.5" />
                      Correct Answer
                    </span>
                  )}
                  <div className="text-right">
                    <span className="font-mono text-lg sm:text-xl font-black text-white">
                      {dist.pct}%
                    </span>
                    <span className="text-[11px] text-slate-400 ml-1.5">
                      ({dist.count})
                    </span>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Question Performance Statistics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
        <div>
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Answered</span>
          <div className="font-mono text-lg font-bold text-white mt-0.5">
            {answeredCount} <span className="text-xs text-slate-400 font-normal">({notAnsweredCount} skipped)</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Correct</span>
          <div className="font-mono text-lg font-bold text-emerald-400 mt-0.5">
            {correctCount}
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Incorrect</span>
          <div className="font-mono text-lg font-bold text-rose-400 mt-0.5">
            {answeredCount - correctCount}
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Class Accuracy</span>
          <div className="font-mono text-lg font-bold text-blue-400 mt-0.5">
            {accuracyPct}%
          </div>
        </div>
      </div>

      {/* Educational Explanation Banner */}
      {explanation && (
        <div className="p-5 rounded-2xl bg-blue-950/30 border border-blue-500/30 text-blue-100 flex items-start gap-3.5 animate-slide-up">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0 mt-0.5">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
              Explanation & Learning Note
            </div>
            <p className="text-sm leading-relaxed text-blue-100/90 font-medium">
              {explanation}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
