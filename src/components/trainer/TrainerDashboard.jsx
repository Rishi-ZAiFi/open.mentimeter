import React, { useState } from 'react';
import { useQuiz } from '../../context/QuizContext';
import { Play, Users, Clock, Zap, FileText, QrCode, Sparkles, CheckCircle, Copy, Check } from 'lucide-react';
import QRCodeModal from '../common/QRCodeModal';

export default function TrainerDashboard() {
  const { 
    sessionCode, 
    participants, 
    totalQuestions, 
    timerDuration, 
    speedBonusEnabled, 
    startQuiz, 
    serverInfo,
    trainerName
  } = useQuiz();

  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);

  const joinUrl = `${serverInfo.joinUrl}?code=${sessionCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 animate-fade-in">
      
      {/* Top Banner / Command Center Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 p-6 sm:p-10 shadow-2xl mb-8">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Session Ready to Launch</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Digi Warriors — Course 1 Day 1
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Host: <span className="text-slate-200 font-semibold">{trainerName || 'Trainer'}</span> &bull; Local-first examination mode
            </p>
          </div>

          {/* Large Session Code Box with QR Modal trigger */}
          <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-700/80 rounded-2xl p-4 shadow-xl">
            <div className="text-left">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Session Code
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-black text-blue-400 tracking-widest">
                {sessionCode}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 border-l border-slate-800 pl-3">
              <button
                onClick={() => setShowQr(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition-colors"
                title="Open QR Code for Mobile Scanning"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR Code</span>
              </button>
              <button
                onClick={copyLink}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Questions Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Questions
            </span>
            <FileText className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {totalQuestions}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            4-Option MCQs
          </div>
        </div>

        {/* Participants Joined Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Participants
            </span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            {participants.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Live joined in session
          </div>
        </div>

        {/* Timer Mode Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Timer
            </span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {timerDuration > 0 ? `${timerDuration}s` : 'None'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Per question countdown
          </div>
        </div>

        {/* Scoring Mode Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Scoring Mode
            </span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-white">
            {speedBonusEnabled ? 'Base + Speed' : 'Standard (100pt)'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {speedBonusEnabled ? '100 Base + Up to 50 Bonus' : '100 pts per correct answer'}
          </div>
        </div>

      </div>

      {/* Participants Waiting Room Roster & Start Button Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left 2 Cols: Live Participant Roster */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">
                Participants Joined ({participants.length})
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Real-time sync
            </span>
          </div>

          {participants.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500 animate-pulse">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-300 mb-1">
                Waiting for participants to join...
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Share session code <strong className="text-blue-400 font-mono">{sessionCode}</strong> or display the QR code on the projector.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
              {participants.map((p, idx) => (
                <div
                  key={p.id || idx}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-emerald-500/40 text-slate-200 text-sm font-medium animate-scale-in"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="truncate">{p.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Big Action Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white mb-2">
              Ready to Begin?
            </h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Once you start the quiz, all participants will immediately receive Question 1 on their screens and the timer will begin.
            </p>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 mb-6 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Total Assessment Pool:</span>
                <span className="text-white font-mono font-bold">{totalQuestions} Questions</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Active Participants:</span>
                <span className="text-emerald-400 font-mono font-bold">{participants.length} Ready</span>
              </div>
            </div>
          </div>

          <button
            onClick={startQuiz}
            disabled={participants.length === 0}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black text-base shadow-xl shadow-emerald-500/20 transition-all duration-200 transform hover:scale-[1.02]"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>START QUIZ</span>
          </button>
        </div>

      </div>

      {showQr && <QRCodeModal onClose={() => setShowQr(false)} />}
    </div>
  );
}
