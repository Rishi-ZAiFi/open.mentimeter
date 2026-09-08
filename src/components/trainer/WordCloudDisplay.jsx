import React, { useMemo } from 'react';
import { Cloud } from 'lucide-react';

const COLOR_PALETTE = [
  '#38bdf8', // sky-400
  '#818cf8', // indigo-400
  '#34d399', // emerald-400
  '#fbbf24', // amber-400
  '#f472b6', // pink-400
  '#a78bfa', // purple-400
  '#fb923c', // orange-400
  '#2dd4bf', // teal-400
  '#60a5fa', // blue-400
];

export default function WordCloudDisplay({ words = [], totalResponses = 0 }) {
  // Compute frequency map
  const wordStats = useMemo(() => {
    if (!words || words.length === 0) return [];

    const map = {};
    words.forEach(entry => {
      const clean = (entry.text || entry || '').trim();
      if (!clean) return;
      const lower = clean.toLowerCase();
      if (!map[lower]) {
        map[lower] = { text: clean, count: 0 };
      }
      map[lower].count += 1;
    });

    const list = Object.values(map);
    list.sort((a, b) => b.count - a.count);

    const maxCount = list[0]?.count || 1;
    const minCount = list[list.length - 1]?.count || 1;

    return list.map((item, index) => {
      // Scale font size from 18px to 64px based on relative frequency
      const normalized = maxCount === minCount ? 0.5 : (item.count - minCount) / (maxCount - minCount);
      const fontSize = Math.round(18 + normalized * 46);
      const color = COLOR_PALETTE[index % COLOR_PALETTE.length];
      const rotation = index % 5 === 0 ? -6 : index % 7 === 0 ? 6 : 0;

      return {
        ...item,
        fontSize,
        color,
        rotation,
      };
    });
  }, [words]);

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-3xl p-6 lg:p-10 shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Background glow decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2 text-blue-400">
          <Cloud className="w-6 h-6 animate-pulse" />
          <span className="font-semibold text-sm uppercase tracking-wider">Live Audience Word Cloud</span>
        </div>
        <div className="bg-slate-800/80 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-300 border border-slate-700/60">
          {totalResponses} {totalResponses === 1 ? 'submission' : 'submissions'} • {wordStats.length} unique words
        </div>
      </div>

      {/* Cloud Container */}
      {wordStats.length === 0 ? (
        <div className="py-24 text-center text-slate-500 flex flex-col items-center justify-center">
          <Cloud className="w-16 h-16 mb-4 opacity-30 stroke-1 animate-bounce" />
          <p className="text-lg font-medium text-slate-400">Waiting for participants to submit words...</p>
          <p className="text-xs text-slate-500 mt-1">Words will appear here live with dynamic frequency sizing</p>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 min-h-[360px] p-4 select-none">
          {wordStats.map((item, idx) => (
            <span
              key={idx}
              className="inline-block transition-all duration-300 hover:scale-125 cursor-default font-extrabold tracking-tight drop-shadow-md animate-fade-in"
              style={{
                fontSize: `${item.fontSize}px`,
                color: item.color,
                transform: `rotate(${item.rotation}deg)`,
                lineHeight: 1.1,
              }}
              title={`${item.text}: ${item.count} ${item.count === 1 ? 'vote' : 'votes'}`}
            >
              {item.text}
              {item.count > 1 && (
                <sup className="text-xs font-semibold ml-1 opacity-70 bg-slate-800/80 px-1.5 py-0.5 rounded-full">
                  {item.count}
                </sup>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
