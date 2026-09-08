import React, { useState, useEffect } from 'react';
import { useQuiz } from '../../context/QuizContext';
import { soundFX } from '../../services/soundEffects';
import {
  Presentation,
  Smartphone,
  ArrowRight,
  Sparkles,
  Trophy,
  Zap,
  Wifi,
  Cloud,
  MessageSquare,
  Shield,
  CheckCircle2,
  Lock,
  QrCode,
  Flame,
  Volume2
} from 'lucide-react';

export default function RoleSelection({ onSelectRole }) {
  const { joinSession, errorMessage, setErrorMessage } = useQuiz();
  
  // Instant Quick-Join Form State
  const [quickCode, setQuickCode] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('code') || localStorage.getItem('dw_session_code') || '';
    }
    return '';
  });
  const [quickName, setQuickName] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('dw_participant_name') || '' : ''));
  const [quickPhone, setQuickPhone] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('dw_participant_phone') || '' : ''));
  const [isJoining, setIsJoining] = useState(false);
  const [activeTab, setActiveTab] = useState('participant'); // 'participant' | 'trainer'

  // Interactive Live Reaction Demo on Landing Page
  const [demoEmoji, setDemoEmoji] = useState(null);

  const handleTestEmoji = (emoji) => {
    soundFX.playPop();
    setDemoEmoji(emoji);
    setTimeout(() => setDemoEmoji(null), 500);
  };

  const handleQuickJoin = (e) => {
    e.preventDefault();
    if (!quickCode.trim() || !quickName.trim() || !quickPhone.trim()) {
      setErrorMessage('Please fill in Session Code, Name, and Mobile Number.');
      return;
    }

    setIsJoining(true);
    joinSession({
      code: quickCode.toUpperCase().trim(),
      name: quickName.trim(),
      phone: quickPhone.trim()
    }, (res) => {
      setIsJoining(false);
      if (res && res.success) {
        soundFX.playCorrect();
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-14 animate-fade-in select-none">
      
      {/* Hero Header */}
      <div className="text-center mb-10 sm:mb-12 relative">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold mb-4 shadow-lg backdrop-blur-md animate-scale-in">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Local-First • Zero Cloud • Sub-Millisecond Sync</span>
        </div>

        <h1 className="text-3xl sm:text-6xl font-black text-white tracking-tight leading-tight">
          Live Interactive Assessments <br />
          <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
            Built for Real-Time Classrooms
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 mt-3 max-w-xl mx-auto leading-relaxed">
          The 100% offline, local Wi-Fi alternative to Mentimeter & Kahoot. Host speed-bonus quizzes, dynamic word clouds, live Q&A, and emoji reaction streams.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mt-5 max-w-2xl mx-auto text-[11px] sm:text-xs">
          <span className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" /> Hotspot / LAN Sync
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" /> Live Reactions
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5 text-sky-400" /> Word Clouds
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-purple-400" /> Phone Remote
          </span>
        </div>
      </div>

      {/* Main Interactive Bento / Join Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left 7 Cols: Instant Join Card (Student Focused) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Join Live Session</h2>
                  <p className="text-xs text-slate-400">Enter code to vote, answer questions & react</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                Participant
              </span>
            </div>

            {/* Error notice if any */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs font-semibold animate-shake">
                {errorMessage}
              </div>
            )}

            {/* Quick Join Form */}
            <form onSubmit={handleQuickJoin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  6-Digit Session PIN
                </label>
                <input
                  type="text"
                  value={quickCode}
                  onChange={(e) => setQuickCode(e.target.value.toUpperCase())}
                  placeholder="e.g. DW-7764"
                  maxLength={10}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl px-4 py-3 text-emerald-400 font-mono text-lg font-black placeholder-slate-600 outline-none uppercase tracking-wider"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    maxLength={40}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm font-semibold placeholder-slate-600 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Mobile Number (ID)
                  </label>
                  <input
                    type="tel"
                    value={quickPhone}
                    onChange={(e) => setQuickPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit number"
                    maxLength={10}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-sm font-semibold placeholder-slate-600 outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isJoining}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold rounded-2xl text-base shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>{isJoining ? 'Connecting to LAN...' : 'ENTER LIVE QUIZ'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Quick micro-interaction tester */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Try live reaction audio:</span>
            <div className="flex items-center gap-1.5">
              {['❤️', '🔥', '🎉', '💡'].map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => handleTestEmoji(em)}
                  className={`p-1 text-base rounded-lg hover:bg-slate-800 transition-transform ${demoEmoji === em ? 'scale-125' : ''}`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Trainer Host Command Hub */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                  <Presentation className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Trainer Portal</h2>
                  <p className="text-xs text-slate-400">Host & manage assessment session</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
                Host
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Launch real-time synced question broadcasts, reveal interactive bar charts, dynamic word clouds, and track student growth timelines across days.
            </p>

            <div className="space-y-3 mb-6">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Speed Bonus Scoring:</span>
                <span className="text-emerald-400 font-bold">100 + up to 50 pts</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Phone Remote Support:</span>
                <span className="text-blue-400 font-bold">Mentimote Enabled</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectRole('trainer')}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-2xl text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Presentation className="w-4 h-4" />
            <span>LAUNCH TRAINER DASHBOARD</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
