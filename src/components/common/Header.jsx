import React, { useState } from 'react';
import { useQuiz } from '../../context/QuizContext';
import { soundFX } from '../../services/soundEffects';
import { QrCode, Wifi, WifiOff, LogOut, Shield, User, Trash2, Users, UserCheck, Volume2, VolumeX, Settings } from 'lucide-react';
import QRCodeModal from './QRCodeModal';
import StudentProfileModal from '../profile/StudentProfileModal';
import StudentDirectory from '../trainer/StudentDirectory';
import TrainerProfileModal from '../trainer/TrainerProfileModal';

export default function Header() {
  const { 
    role, 
    sessionCode, 
    sessionStatus, 
    connected, 
    resetToHome,
    clearDatabase,
    trainerName,
    participantName,
    participantPhone,
    setParticipantName
  } = useQuiz();
  
  const [showQrModal, setShowQrModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDirectoryModal, setShowDirectoryModal] = useState(false);
  const [showTrainerSettings, setShowTrainerSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(() => soundFX.isMuted());

  // Status Badge configurations
  const getStatusBadge = () => {
    switch (sessionStatus) {
      case 'running':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="hidden sm:inline">Quiz</span> Running
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-400" />
            Paused
          </span>
        );
      case 'finished':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-400" />
            Finished
          </span>
        );
      case 'ready':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse" />
            Ready
          </span>
        );
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          
          {/* Brand & Course Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
              <span className="text-white font-black text-xs sm:text-sm tracking-wider">DW</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-slate-100 text-xs sm:text-base tracking-tight">
                  Digi Warriors
                </span>
                <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                  Portal
                </span>
              </div>
            </div>
          </div>

          {/* Center Info / Status */}
          {sessionCode && (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg">
                <span className="text-[10px] sm:text-xs text-slate-400">Code:</span>
                <span className="font-mono font-bold text-xs sm:text-sm text-blue-400 tracking-wider">
                  {sessionCode}
                </span>
              </div>
              {getStatusBadge()}
            </div>
          )}

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Trainer: Settings & Themes */}
            {role === 'trainer' && (
              <button
                onClick={() => setShowTrainerSettings(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-600/15 border border-purple-500/30 hover:bg-purple-600/25 text-purple-400 text-xs font-bold transition-colors"
                title="Presentation Themes, Timer Presets & Privacy Settings"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Settings & Themes</span>
              </button>
            )}

            {/* Trainer: Student Directory */}
            {role === 'trainer' && (
              <button
                onClick={() => setShowDirectoryModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-600/15 border border-blue-500/30 hover:bg-blue-600/25 text-blue-400 text-xs font-bold transition-colors"
                title="View All Students & Historical Analytics"
              >
                <Users className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Student Directory</span>
              </button>
            )}

            {/* Participant: My Profile */}
            {role === 'participant' && (
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-600/15 border border-emerald-500/30 hover:bg-emerald-600/25 text-emerald-400 text-xs font-bold transition-colors"
                title="View Profile & Past Scores"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">My Profile</span>
              </button>
            )}

            {/* Live QR Code Trigger */}
            {sessionCode && (
              <button
                onClick={() => setShowQrModal(true)}
                title="Show QR Code for Mobile Joining"
                className="p-1.5 sm:p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}

            {/* Sound FX Toggle */}
            <button
              onClick={() => {
                soundFX.toggleMute();
                setIsMuted(soundFX.isMuted());
              }}
              title={isMuted ? "Unmute Audio FX" : "Mute Audio FX"}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />}
            </button>

            {/* Connection Dot */}
            <div className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md bg-slate-900/50 text-xs text-slate-400" title={connected ? 'Connected to Local Real-Time Server' : 'Offline'}>
              {connected ? (
                <Wifi className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
              ) : (
                <WifiOff className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-400 animate-pulse" />
              )}
            </div>

            {/* Clear DB Button (Trainer only) */}
            {role === 'trainer' && (
              <button
                onClick={() => {
                  if (confirm('Clear active live session state? (Student histories in db.json will be preserved)')) {
                    clearDatabase();
                  }
                }}
                title="Reset Live Session"
                className="p-1.5 sm:p-2 rounded-lg bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}

            {/* Exit / Leave */}
            {role && (
              <button
                onClick={() => {
                  if (confirm('Return to home screen?')) {
                    resetToHome();
                  }
                }}
                title="Leave Session"
                className="p-1.5 sm:p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Modals */}
      {showQrModal && <QRCodeModal onClose={() => setShowQrModal(false)} />}
      
      {showProfileModal && (
        <StudentProfileModal
          currentName={participantName}
          currentPhone={participantPhone}
          onClose={() => setShowProfileModal(false)}
          onProfileUpdated={(updated) => {
            if (updated && updated.name) {
              setParticipantName(updated.name);
            }
          }}
        />
      )}

      {showDirectoryModal && (
        <StudentDirectory onClose={() => setShowDirectoryModal(false)} />
      )}

      {showTrainerSettings && (
        <TrainerProfileModal
          isOpen={showTrainerSettings}
          onClose={() => setShowTrainerSettings(false)}
        />
      )}
    </>
  );
}
