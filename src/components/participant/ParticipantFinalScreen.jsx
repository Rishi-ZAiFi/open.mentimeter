import React, { useEffect } from 'react';
import { useQuiz } from '../../context/QuizContext';
import confetti from 'canvas-confetti';
import { Trophy, Award, Target, CheckCircle2, XCircle, Sparkles, TrendingUp, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function ParticipantFinalScreen() {
  const { participantName, leaderboard, analytics, totalQuestions } = useQuiz();

  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });
  }, []);

  // Find this participant's full profile
  const myEntry = leaderboard.find(p => p.name.toLowerCase() === participantName.toLowerCase());
  const rank = myEntry?.currentRank || 1;
  const score = myEntry?.score || 0;
  const isTop3 = rank <= 3;

  const answersObj = myEntry?.answers || {};
  const correctCount = Object.values(answersObj).filter(a => a.isCorrect).length;
  const accuracyPct = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // Build progression data
  let runningScore = 0;
  const progressionData = Array.from({ length: totalQuestions }).map((_, idx) => {
    const ans = answersObj[idx];
    if (ans && ans.pointsEarned) {
      runningScore += ans.pointsEarned;
    }
    return {
      question: `Q${idx + 1}`,
      score: runningScore
    };
  });

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12 animate-fade-in space-y-6">
      
      {/* Top Banner */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Examination Completed</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          🎉 Great Effort, {participantName}!
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Digi Warriors — Course 1 Day 1 Assessment
        </p>
      </div>

      {/* Rank & Scorecard Hero Card */}
      <div className={`p-8 rounded-3xl border text-center shadow-2xl relative overflow-hidden ${
        isTop3 
          ? 'bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/50' 
          : 'bg-slate-900 border-slate-800'
      }`}>
        
        {/* Rank Badge */}
        <div className="w-20 h-20 rounded-3xl bg-slate-950/80 border border-slate-700/80 text-4xl flex items-center justify-center mx-auto mb-4 shadow-xl">
          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Final Cohort Standing
        </span>
        <div className="font-mono text-4xl sm:text-5xl font-black text-white mt-1 mb-4">
          Rank #{rank}
        </div>

        <div className="inline-block px-5 py-2 rounded-2xl bg-blue-500/10 border border-blue-500/20 font-mono text-2xl font-black text-blue-400">
          {score.toLocaleString()} <span className="text-sm font-sans text-slate-400 font-normal">points</span>
        </div>

      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 uppercase font-semibold">Accuracy</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono text-2xl font-black text-emerald-400">
            {accuracyPct}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {correctCount} of {totalQuestions} correct
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 uppercase font-semibold">Cohort Average</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-mono text-2xl font-black text-amber-400">
            {analytics?.avgScore ? analytics.avgScore.toLocaleString() : '-'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Points per participant
          </div>
        </div>
      </div>

      {/* Progression Sparkline */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Your Score Trajectory
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Q1 &rarr; Q{totalQuestions}</span>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="question" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
