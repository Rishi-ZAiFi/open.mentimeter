import React from 'react';
import { Presentation, Smartphone, ArrowRight, Sparkles, Trophy } from 'lucide-react';

export default function RoleSelection({ onSelectRole }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20 animate-fade-in">
      
      {/* Header / Intro */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Local-First Live Assessment Engine</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
          Digi Warriors
        </h1>
        <p className="text-lg sm:text-xl font-medium text-slate-400">
          Course 1 — Day 1 Technical Examination
        </p>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto">
          Choose your role below to host or join the interactive examination session.
        </p>
      </div>

      {/* Role Choice Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        
        {/* Trainer Card */}
        <button
          onClick={() => onSelectRole('trainer')}
          className="group relative flex flex-col text-left p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/80 border border-slate-700/60 hover:border-blue-500/60 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
            <Presentation className="w-7 h-7" />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                Trainer
              </h2>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Launch and control the live quiz session, manage questions, timers, answer distribution, and analyze class performance.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Presenter & Control Panel</span>
            <span className="font-semibold text-blue-400">Host Session &rarr;</span>
          </div>
        </button>

        {/* Participant Card */}
        <button
          onClick={() => onSelectRole('participant')}
          className="group relative flex flex-col text-left p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/80 border border-slate-700/60 hover:border-emerald-500/60 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
            <Smartphone className="w-7 h-7" />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                Participant
              </h2>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Join an active quiz session with your session code and name. Answer in real-time, view live leaderboards, and track your rank.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Mobile, Tablet & PC</span>
            <span className="font-semibold text-emerald-400">Join Quiz &rarr;</span>
          </div>
        </button>

      </div>

      {/* Feature Highlights */}
      <div className="mt-16 text-center">
        <div className="inline-grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 max-w-2xl mx-auto text-xs text-slate-400">
          <div className="flex flex-col items-center gap-1">
            <span className="font-bold text-slate-200">100% Local-First</span>
            <span>No cloud or internet needed</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="font-bold text-slate-200">Instant Real-Time</span>
            <span>Zero-latency LAN sync</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="font-bold text-slate-200">Live Analytics</span>
            <span>Question & category charts</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="font-bold text-slate-200">CSV Export</span>
            <span>Full audit & reports</span>
          </div>
        </div>
      </div>

    </div>
  );
}
