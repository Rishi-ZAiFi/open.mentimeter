import React from 'react';
import { X, Trophy, CheckCircle, XCircle, Clock, Target, Zap, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function ParticipantDetailModal({ participant, totalQuestions = 20, questions = [], onClose }) {
  if (!participant) return null;

  const answersObj = participant.answers || {};
  const answeredCount = Object.keys(answersObj).length;
  const correctCount = Object.values(answersObj).filter(a => a.isCorrect).length;
  const incorrectCount = answeredCount - correctCount;
  const unansweredCount = Math.max(0, totalQuestions - answeredCount);
  const accuracyPct = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const times = Object.values(answersObj).map(a => a.responseTimeMs || 0).filter(t => t > 0);
  const avgResponseTimeSec = times.length > 0 
    ? (times.reduce((a, b) => a + b, 0) / times.length / 1000).toFixed(2)
    : '0.00';

  // Build Score Progression Data for Line Graph
  let runningScore = 0;
  const progressionData = Array.from({ length: totalQuestions }).map((_, idx) => {
    const ans = answersObj[idx];
    if (ans && ans.pointsEarned) {
      runningScore += ans.pointsEarned;
    }
    return {
      question: `Q${idx + 1}`,
      score: runningScore,
      pointsEarned: ans ? ans.pointsEarned : 0,
      isCorrect: ans ? ans.isCorrect : false
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl animate-scale-in">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header / Participant Bio */}
        <div className="flex items-start gap-4 mb-6 pb-6 border-b border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xl">
            {participant.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-black text-white">
                {participant.name}
              </h2>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Rank #{participant.currentRank || 1}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Individual Assessment Performance Profile
            </p>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] uppercase font-semibold text-slate-400">Total Score</span>
            <div className="font-mono text-2xl font-black text-blue-400 mt-1">
              {(participant.score || 0).toLocaleString()}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] uppercase font-semibold text-slate-400">Accuracy</span>
            <div className="font-mono text-2xl font-black text-emerald-400 mt-1">
              {accuracyPct}%
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] uppercase font-semibold text-slate-400">Correct / Wrong</span>
            <div className="font-mono text-xl font-black text-white mt-1">
              <span className="text-emerald-400">{correctCount}</span> / <span className="text-rose-400">{incorrectCount}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] uppercase font-semibold text-slate-400">Avg Response Time</span>
            <div className="font-mono text-xl font-black text-amber-400 mt-1">
              {avgResponseTimeSec}s
            </div>
          </div>
        </div>

        {/* Score Progression Graph */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Score Progression Across Questions
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Q1 &rarr; Q{totalQuestions}</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="question" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6, fill: '#60a5fa' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Question Review List */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
            Question-by-Question Response Audit
          </h3>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {Array.from({ length: totalQuestions }).map((_, qIdx) => {
              const ans = answersObj[qIdx];
              const q = questions[qIdx] || {};
              const isAnswered = ans !== undefined && ans.selectedOption !== null;
              const isCorrect = ans?.isCorrect;
              const optionLetters = ['A', 'B', 'C', 'D'];

              return (
                <div
                  key={qIdx}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
                    !isAnswered
                      ? 'bg-slate-950/40 border-slate-800/60 text-slate-400'
                      : isCorrect
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-100'
                      : 'bg-rose-950/20 border-rose-500/30 text-rose-100'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                    <span className="font-mono font-bold text-slate-400 w-7">
                      Q{qIdx + 1}
                    </span>
                    <span className="truncate text-slate-200 font-medium">
                      {q.question || `Question ${qIdx + 1}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0 font-mono">
                    {isAnswered ? (
                      <>
                        <span className="text-slate-400">
                          Selected: <strong className="text-white">{optionLetters[ans.selectedOption]}</strong>
                        </span>
                        <span className="font-bold text-blue-400">
                          +{ans.pointsEarned || 0} pts
                        </span>
                        {isCorrect ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400" />
                        )}
                      </>
                    ) : (
                      <span className="text-slate-400 italic">Unanswered</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
