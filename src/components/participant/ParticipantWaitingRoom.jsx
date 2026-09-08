import React, { useState } from 'react';
import { useQuiz } from '../../context/QuizContext';
import ReactionActionBar from '../common/ReactionActionBar';
import QAModal from '../common/QAModal';
import { Sparkles, CheckCircle2, Users, Wifi, UserCheck } from 'lucide-react';

export default function ParticipantWaitingRoom() {
  const { participantName, sessionCode, participants, qaQuestions = [] } = useQuiz();
  const [isQAOpen, setIsQAOpen] = useState(false);

  const otherPeers = participants.filter(p => p.name.toLowerCase() !== participantName.toLowerCase());

  return (
    <div className="max-w-md mx-auto px-3 sm:px-4 py-6 sm:py-16 animate-fade-in text-center">
      
      {/* Waiting Card */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden">
        
        {/* Glow Effect */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Big Avatar Badge */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-2xl sm:text-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/20 animate-scale-in">
          {participantName.charAt(0).toUpperCase()}
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>You're in!</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-1">
          {participantName}
        </h1>
        <p className="text-xs font-medium text-slate-400 mb-6">
          Digi Warriors — Course 1 Day 1
        </p>

        {/* Details Box */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-6 text-left space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-xs text-slate-400">Session Code:</span>
            <span className="font-mono font-black text-sm text-blue-400 tracking-wider">{sessionCode}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Cohort Connected:</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {Math.max(1, participants.length)} Ready
            </span>
          </div>
        </div>

        {/* Live Status Pulse */}
        <div className="flex items-center justify-center gap-2.5 text-xs text-slate-300 font-medium py-2 px-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Waiting for trainer to start...</span>
        </div>

        {/* Connected Peers list if any */}
        {otherPeers.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-left">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-400" />
              <span>Other Participants in Room ({otherPeers.length}):</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {otherPeers.map((p, i) => (
                <span key={p.id || i} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>

      <div className="mt-6 mb-16 text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
        <Wifi className="w-3.5 h-3.5 text-emerald-400" />
        <span>Live local connection active &bull; Keep this screen open</span>
      </div>

      {/* Floating Reaction Bar & Q&A */}
      <ReactionActionBar onOpenQA={() => setIsQAOpen(true)} qaCount={qaQuestions.length} />

      {/* Audience Q&A Modal */}
      <QAModal isOpen={isQAOpen} onClose={() => setIsQAOpen(false)} />

    </div>
  );
}
