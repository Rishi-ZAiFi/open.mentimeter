import React, { useState, useEffect } from 'react';
import { useQuiz } from '../../context/QuizContext';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Award, 
  BarChart2, 
  Download, 
  RotateCcw, 
  PlusCircle, 
  Users, 
  Target, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles,
  Search,
  ArrowUpRight,
  Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell 
} from 'recharts';
import { exportParticipantsCsv, exportQuestionsCsv } from '../../services/exportCsv';
import ParticipantDetailModal from './ParticipantDetailModal';

export default function TrainerFinalResults() {
  const { 
    analytics, 
    leaderboard = [], 
    totalQuestions, 
    sessionCode, 
    restartQuiz, 
    resetToHome,
    currentQuestion
  } = useQuiz();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'class_graph' | 'categories' | 'participants'
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fire celebratory confetti on mount
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  const totalParticipants = analytics?.totalParticipants || leaderboard.length;
  const avgScore = analytics?.avgScore || 0;
  const avgAccuracy = analytics?.avgAccuracy || 0;
  const maxScore = analytics?.maxScore || 0;
  const minScore = analytics?.minScore || 0;
  const questionAnalytics = analytics?.questionAnalytics || [];
  const categoryAnalytics = analytics?.categoryAnalytics || [];

  // Top 3 Podium
  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];

  // Prepare Class Accuracy Data for chart
  const classAccuracyChartData = questionAnalytics.map((q, idx) => ({
    question: `Q${idx + 1}`,
    accuracy: q.accuracyPct || 0,
    category: q.category,
    correctCount: q.correctCount,
    answeredCount: q.answeredCount
  }));

  // Category chart colors
  const getCategoryBarColor = (accuracy) => {
    if (accuracy >= 80) return '#10b981'; // green
    if (accuracy >= 65) return '#3b82f6'; // blue
    if (accuracy >= 50) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  // Filter participants by search
  const filteredParticipants = leaderboard.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 animate-fade-in">
      
      {/* Top Header & Export Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
            <Trophy className="w-3.5 h-3.5" />
            <span>Official Assessment Complete</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            🎉 Final Results & Performance Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Digi Warriors — Course 1 Day 1 &bull; Session <strong className="text-blue-400 font-mono">{sessionCode}</strong>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => exportParticipantsCsv(sessionCode, leaderboard, totalQuestions)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-blue-500 text-slate-200 hover:text-white text-xs font-bold transition-all shadow"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export Roster CSV</span>
          </button>

          <button
            onClick={() => exportQuestionsCsv(sessionCode, questionAnalytics)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500 text-slate-200 hover:text-white text-xs font-bold transition-all shadow"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Questions CSV</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Restart quiz session with the same participants?')) {
                restartQuiz();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500 text-slate-200 hover:text-white text-xs font-bold transition-all shadow"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Restart Quiz</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Start a new quiz session?')) {
                resetToHome();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Quiz</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 my-8">
        
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-semibold text-slate-400">Participants</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {totalParticipants}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Completed Assessment</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-semibold text-slate-400">Average Score</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
            {avgScore.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Points per participant</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-semibold text-slate-400">Class Accuracy</span>
            <Target className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-400 font-mono">
            {avgAccuracy}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Overall correctness</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-semibold text-slate-400">Highest Score</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-400 font-mono">
            {maxScore.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Top performance</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-semibold text-slate-400">Questions</span>
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-300 font-mono">
            {totalQuestions}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Evaluated items</div>
        </div>

      </div>

      {/* Top 3 Podium Cards */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          {/* Rank 2 (Silver) */}
          <div className="order-2 md:order-1 p-6 rounded-3xl bg-slate-900 border border-slate-700/80 text-center shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="w-12 h-12 rounded-2xl bg-slate-300/10 border border-slate-300/30 text-2xl flex items-center justify-center mx-auto mb-3">
              🥈
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Rank 2</span>
              <h3 className="text-xl font-bold text-white truncate mt-1">
                {top2.name}
              </h3>
              <div className="font-mono text-2xl font-black text-slate-300 mt-2">
                {(top2.score || 0).toLocaleString()} <span className="text-xs font-sans text-slate-500 font-normal">pts</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedParticipant(top2)}
              className="mt-4 text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              View Full Profile &rarr;
            </button>
          </div>

          {/* Rank 1 (Gold) */}
          <div className="order-1 md:order-2 p-8 rounded-3xl bg-gradient-to-b from-amber-950/40 to-slate-900 border border-amber-500/50 text-center shadow-2xl relative overflow-hidden transform md:-translate-y-3 flex flex-col justify-between">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-3xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/20">
              🥇
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">Champion &bull; Rank 1</span>
              <h3 className="text-2xl font-black text-white truncate mt-1">
                {top1.name}
              </h3>
              <div className="font-mono text-3xl font-black text-amber-400 mt-2">
                {(top1.score || 0).toLocaleString()} <span className="text-xs font-sans text-amber-200/60 font-normal">pts</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedParticipant(top1)}
              className="mt-4 text-xs text-amber-300 hover:text-amber-200 font-bold"
            >
              View Full Profile &rarr;
            </button>
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="order-3 md:order-3 p-6 rounded-3xl bg-slate-900 border border-amber-900/60 text-center shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-700/10 border border-amber-700/30 text-2xl flex items-center justify-center mx-auto mb-3">
              🥉
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Rank 3</span>
              <h3 className="text-xl font-bold text-white truncate mt-1">
                {top3.name}
              </h3>
              <div className="font-mono text-2xl font-black text-amber-600 mt-2">
                {(top3.score || 0).toLocaleString()} <span className="text-xs font-sans text-slate-500 font-normal">pts</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedParticipant(top3)}
              className="mt-4 text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              View Full Profile &rarr;
            </button>
          </div>

        </div>
      )}

      {/* Analytics Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Full Leaderboard</span>
        </button>

        <button
          onClick={() => setActiveTab('class_graph')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'class_graph'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Class Accuracy Curve</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'categories'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Category Performance Analysis</span>
        </button>
      </div>

      {/* TAB 1: FULL LEADERBOARD */}
      {activeTab === 'overview' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white">
              All Participants ({leaderboard.length})
            </h2>

            {/* Search Input */}
            <div className="relative w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search participant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredParticipants.map((p, idx) => (
              <div
                key={p.id || idx}
                onClick={() => setSelectedParticipant(p)}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-blue-500/50 hover:bg-slate-950 cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-slate-300">
                    {p.currentRank || idx + 1}
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-white text-sm">
                      {p.name}
                    </span>
                    <span className="text-xs text-slate-500 ml-2">
                      Click to inspect scorecard
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="font-mono text-base font-black text-blue-400">
                      {(p.score || 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-1">pts</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CLASS ACCURACY CURVE */}
      {activeTab === 'class_graph' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl animate-fade-in">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">
              Question-by-Question Class Accuracy
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Visualizes accuracy across all {totalQuestions} questions to highlight where the cohort struggled.
            </p>
          </div>

          <div className="h-80 w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={classAccuracyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="question" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis unit="%" domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => [`${value}% Accuracy`, 'Class Performance']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 5 }}
                  activeDot={{ r: 8, fill: '#60a5fa' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Table of Hardest Questions */}
          <div className="border-t border-slate-800 pt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Questions Ranked by Difficulty (Lowest Accuracy First)
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {[...questionAnalytics].sort((a, b) => a.accuracyPct - b.accuracyPct).map((q, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                    <span className="font-mono font-bold text-blue-400">Q{q.questionIndex + 1}</span>
                    <span className="text-slate-300 truncate">{q.question}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono flex-shrink-0">
                    <span className="text-slate-400">({q.correctCount}/{q.totalParticipants} correct)</span>
                    <span className={`font-bold px-2 py-0.5 rounded ${q.accuracyPct < 60 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {q.accuracyPct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CATEGORY ANALYSIS */}
      {activeTab === 'categories' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl animate-fade-in">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">
              Performance by Technical Category
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Reveals skill gaps and identifies specific technical domains needing trainer reinforcement.
            </p>
          </div>

          <div className="h-80 w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryAnalytics} layout="vertical" margin={{ left: 40, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" domain={[0, 100]} unit="%" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis dataKey="category" type="category" stroke="#cbd5e1" tick={{ fontSize: 12 }} width={120} />
                <Tooltip
                  formatter={(value) => [`${value}% Accuracy`, 'Category Mastery']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="accuracyPct" radius={[0, 8, 8, 0]}>
                  {categoryAnalytics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCategoryBarColor(entry.accuracyPct)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryAnalytics.map((cat, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">{cat.category}</span>
                  <span className="font-mono text-sm font-black text-blue-400">{cat.accuracyPct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${cat.accuracyPct}%`,
                      backgroundColor: getCategoryBarColor(cat.accuracyPct)
                    }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 mt-2">
                  {cat.totalQuestions} questions in this module
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Individual Participant Detail Drilldown Modal */}
      {selectedParticipant && (
        <ParticipantDetailModal
          participant={selectedParticipant}
          totalQuestions={totalQuestions}
          questions={questionAnalytics}
          onClose={() => setSelectedParticipant(null)}
        />
      )}

    </div>
  );
}
