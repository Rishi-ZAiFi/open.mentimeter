import React, { useMemo } from 'react';
import { Cloud, Sparkles, MessageSquare } from 'lucide-react';

const WORD_COLORS = [
  'text-sky-400 border-sky-500/30 bg-sky-500/10',
  'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  'text-amber-400 border-amber-500/30 bg-amber-500/10',
  'text-purple-400 border-purple-500/30 bg-purple-500/10',
  'text-rose-400 border-rose-500/30 bg-rose-500/10',
  'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
  'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
  'text-teal-400 border-teal-500/30 bg-teal-500/10',
  'text-pink-400 border-pink-500/30 bg-pink-500/10'
];

export default function WordCloud({ wordMap = {}, totalSubmissions = 0, prompt = '' }) {
  const sortedWords = useMemo(() => {
    const entries = Object.entries(wordMap || {});
    if (entries.length === 0) return [];
    
    const maxCount = Math.max(...entries.map(([, c]) => c), 1);
    const minCount = Math.min(...entries.map(([, c]) => c), 1);

    return entries.map(([word, count], idx) => {
      // Scale font size from 14px to 54px based on count
      let sizePx = 16;
      if (maxCount === minCount) {
        sizePx = 24;
      } else {
        const ratio = (count - minCount) / (maxCount - minCount);
        sizePx = Math.round(16 + ratio * 38);
      }

      const colorClass = WORD_COLORS[idx % WORD_COLORS.length];
      return { word, count, sizePx, colorClass };
    }).sort((a, b) => b.count - a.count);
  }, [wordMap]);

  return (
    <div className="w-full rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-10 shadow-2xl animate-fade-in flex flex-col justify-between min-h-[380px]">
      
      {/* Header Info */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800 flex-wrap">
        <div className="flex items-center gap-2 text-sky-400">
          <Cloud className="w-5 h-5 animate-pulse" />
          <span className="font-bold text-sm sm:text-base">Live Interactive Word Cloud</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono">
            Unique: <strong className="text-white">{sortedWords.length}</strong>
          </span>
          <span className="px-3 py-1 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300 font-mono">
            Submissions: <strong className="text-sky-400">{totalSubmissions}</strong>
          </span>
        </div>
      </div>

      {/* Cloud Display Canvas */}
      {sortedWords.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4 animate-bounce">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Waiting for Word Submissions...</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            Attendees can type 1-3 words on their phones. Responses will animate dynamically into the cloud in real-time.
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-wrap items-center justify-center gap-3 sm:gap-4 p-4 sm:p-8">
          {sortedWords.map((item) => (
            <div
              key={item.word}
              style={{ fontSize: `${item.sizePx}px` }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border font-black tracking-tight shadow-lg transition-all duration-300 transform hover:scale-110 cursor-default animate-fade-in ${item.colorClass}`}
            >
              <span>{item.word}</span>
              {item.count > 1 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-950/70 border border-white/10 font-bold opacity-80">
                  {item.count}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Bottom Hint */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Larger words indicate higher frequency among attendees</span>
        </span>
        <span className="font-mono text-slate-400">Zero-latency WebSocket update</span>
      </div>

    </div>
  );
}
