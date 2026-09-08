import React, { useEffect, useState } from 'react';
import { useQuiz } from '../../context/QuizContext';
import confetti from 'canvas-confetti';
import { Trophy, Award, Target, CheckCircle2, XCircle, Sparkles, TrendingUp, BarChart2, Zap, Printer, Clock } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import ReactionActionBar from '../common/ReactionActionBar';
import QAModal from '../common/QAModal';

export default function ParticipantFinalScreen() {
  const { participantName, leaderboard, analytics, totalQuestions, qaQuestions = [] } = useQuiz();
  const [isQAOpen, setIsQAOpen] = useState(false);

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
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

  // Compute speed stats
  const answerEntries = Object.values(answersObj);
  const totalTimeSec = answerEntries.reduce((acc, a) => acc + (a.responseTimeMs || 0) / 1000, 0);
  const avgTimeSec = answerEntries.length > 0 ? (totalTimeSec / answerEntries.length).toFixed(1) : '0';

  // Badge tier
  let badgeTitle = '🌟 Course Participant';
  let badgeStyle = 'bg-blue-600/20 text-blue-400 border-blue-500/30';
  if (rank === 1) {
    badgeTitle = '👑 Grand Champion';
    badgeStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  } else if (rank === 2) {
    badgeTitle = '🥈 Silver Podium';
    badgeStyle = 'bg-slate-300/20 text-slate-200 border-slate-400/40';
  } else if (rank === 3) {
    badgeTitle = '🥉 Bronze Podium';
    badgeStyle = 'bg-amber-700/20 text-amber-400 border-amber-600/40';
  } else if (accuracyPct >= 80) {
    badgeTitle = '🎯 High Accuracy Master';
    badgeStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  }

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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12 animate-fade-in space-y-6 select-none">
      
      {/* Top Banner */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Official Assessment Report</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          🎉 Great Work, {participantName}!
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Digi Warriors — Performance Summary & Report Card
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

        <div className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold border mb-3 ${badgeStyle}`}>
          {badgeTitle}
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
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
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 uppercase font-semibold mb-1">
            <Target className="w-3.5 h-3.5 text-emerald-400" /> Accuracy
          </div>
          <div className="font-mono text-xl sm:text-2xl font-black text-emerald-400">
            {accuracyPct}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {correctCount}/{totalQuestions} correct
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 uppercase font-semibold mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> Avg Speed
          </div>
          <div className="font-mono text-xl sm:text-2xl font-black text-amber-400">
            {avgTimeSec}s
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Per question
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 uppercase font-semibold mb-1">
            <Trophy className="w-3.5 h-3.5 text-blue-400" /> Avg Cohort
          </div>
          <div className="font-mono text-xl sm:text-2xl font-black text-blue-400">
            {analytics?.avgScore ? analytics.avgScore.toLocaleString() : '-'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Cohort benchmark
          </div>
        </div>
      </div>

      {/* Progression Sparkline */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Score Accumulation
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Q1 &rarr; Q{totalQuestions}</span>
        </div>

        <div className="h-40 w-full">
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

      {/* Print / Save Action */}
      <div className="flex justify-center pt-2 pb-16">
        <button
          onClick={handlePrint}
          type="button"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 shadow-md transition-all active:scale-95"
        >
          <Printer className="w-4 h-4 text-blue-400" />
          <span>Print / Save Report Card</span>
        </button>
      </div>

      {/* Floating Reaction Bar & Q&A */}
      <ReactionActionBar onOpenQA={() => setIsQAOpen(true)} qaCount={qaQuestions.length} />

      {/* Audience Q&A Modal */}
      <QAModal isOpen={isQAOpen} onClose={() => setIsQAOpen(false)} />

    </div>
  );
}
