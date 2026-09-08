import React, { useState, useEffect } from 'react';
import { useQuiz } from '../../context/QuizContext';
import { soundFX } from '../../services/soundEffects';
import {
  User,
  Settings,
  Palette,
  Sliders,
  Volume2,
  VolumeX,
  Shield,
  Clock,
  Zap,
  Award,
  BookOpen,
  Calendar,
  Download,
  X,
  Check,
  Sparkles,
  BarChart3,
  Users
} from 'lucide-react';

const THEMES = [
  { id: 'midnight', name: 'Midnight Obsidian', bg: 'from-slate-900 to-slate-950', border: 'border-blue-500/50', accent: 'bg-blue-600' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', bg: 'from-purple-950 to-slate-950', border: 'border-cyan-500/50', accent: 'bg-cyan-500' },
  { id: 'emerald', name: 'Deep Emerald', bg: 'from-emerald-950 to-slate-950', border: 'border-emerald-500/50', accent: 'bg-emerald-500' },
  { id: 'sunset', name: 'Sunset Flame', bg: 'from-rose-950 to-slate-950', border: 'border-amber-500/50', accent: 'bg-amber-500' }
];

export default function TrainerProfileModal({ isOpen, onClose }) {
  const { trainerName, sessionCode, totalQuestions } = useQuiz();
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'history' | 'profile'
  const [trainerStats, setTrainerStats] = useState({ totalSessions: 1, totalStudents: 24, avgCohortScore: 2359, topTopic: 'Lookup Functions' });
  const [pastSessions, setPastSessions] = useState([]);
  
  // Trainer Custom Preferences
  const [theme, setTheme] = useState(() => localStorage.getItem('dw_trainer_theme') || 'midnight');
  const [defaultTimer, setDefaultTimer] = useState(() => Number(localStorage.getItem('dw_default_timer')) || 30);
  const [autoAdvance, setAutoAdvance] = useState(() => localStorage.getItem('dw_auto_advance') === 'true');
  const [hidePhones, setHidePhones] = useState(() => localStorage.getItem('dw_hide_phones') === 'true');
  const [speedMultiplier, setSpeedMultiplier] = useState(() => localStorage.getItem('dw_speed_mode') || 'standard');
  const [soundEnabled, setSoundEnabled] = useState(() => !soundFX.isMuted());
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    fetch('/api/trainers')
      .then(res => res.json())
      .then(data => {
        if (data && data.trainers && data.trainers.length > 0) {
          const t = data.trainers.find(x => x.name.toLowerCase() === (trainerName || 'Trainer').toLowerCase()) || data.trainers[0];
          if (t) {
            setTrainerStats({
              totalSessions: t.totalSessions || 1,
              totalStudents: 24,
              avgCohortScore: 2359,
              topTopic: 'Lookup & Reference'
            });
          }
        }
      })
      .catch(() => {});

    fetch('/api/active-sessions')
      .then(res => res.json())
      .then(data => {
        if (data && data.sessions) {
          setPastSessions(data.sessions);
        }
      })
      .catch(() => {});
  }, [trainerName]);

  if (!isOpen) return null;

  const handleSaveSettings = () => {
    localStorage.setItem('dw_trainer_theme', theme);
    localStorage.setItem('dw_default_timer', defaultTimer.toString());
    localStorage.setItem('dw_auto_advance', autoAdvance ? 'true' : 'false');
    localStorage.setItem('dw_hide_phones', hidePhones ? 'true' : 'false');
    localStorage.setItem('dw_speed_mode', speedMultiplier);
    soundFX.setMuted(!soundEnabled);

    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-black flex items-center justify-center shadow-lg shadow-blue-500/20 text-lg">
              {trainerName ? trainerName.charAt(0).toUpperCase() : 'T'}
            </div>
            <div>
              <h2 className="text-lg font-black text-white">{trainerName || 'Lead Trainer'}</h2>
              <p className="text-xs text-slate-400">Trainer Command Center & Customization Hub</p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-800 bg-slate-900/60 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'settings' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Presentation Settings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'history' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Lifetime Analytics</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'settings' && (
            <div className="space-y-6">
              
              {/* Presentation Visual Theme */}
              <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                  <Palette className="w-4 h-4 text-blue-400" />
                  <span>Projector Visual Theme</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTheme(t.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        theme === t.id
                          ? 'border-blue-400 bg-blue-950/40 ring-2 ring-blue-400/40 shadow-lg'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-full h-8 rounded-lg bg-gradient-to-r ${t.bg} border ${t.border} mb-2 flex items-center justify-center`}>
                        {theme === t.id && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <span className="block text-xs font-bold text-slate-200">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Timing & Scoring Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Default Question Timer</span>
                  </label>
                  <select
                    value={defaultTimer}
                    onChange={(e) => setDefaultTimer(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-semibold outline-none focus:border-blue-500"
                  >
                    <option value={15}>15 Seconds (Fast Pace)</option>
                    <option value={30}>30 Seconds (Standard)</option>
                    <option value={45}>45 Seconds (Moderate)</option>
                    <option value={60}>60 Seconds (Deep Thinking)</option>
                    <option value={0}>Untimed (Trainer Controls Advance)</option>
                  </select>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                    <Zap className="w-3.5 h-3.5 text-purple-400" />
                    <span>Scoring Multiplier</span>
                  </label>
                  <select
                    value={speedMultiplier}
                    onChange={(e) => setSpeedMultiplier(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-semibold outline-none focus:border-blue-500"
                  >
                    <option value="standard">Speed Bonus (100 Base + 50 Bonus)</option>
                    <option value="high_stakes">High Stakes (100 Base + 100 Bonus)</option>
                    <option value="flat">Flat Scoring (100 pts per correct)</option>
                  </select>
                </div>
              </div>

              {/* Toggles & Privacy */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Game Show Sound Effects</span>
                    <span className="text-[11px] text-slate-400">Synthesize countdown ticks, reveal chimes, and fanfare</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>

                <div className="w-full h-[1px] bg-slate-800" />

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Audience Privacy Mode</span>
                    <span className="text-[11px] text-slate-400">Mask participant mobile numbers on the big screen leaderboard</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hidePhones}
                    onChange={(e) => setHidePhones(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>
              </div>

            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              {/* Lifetime Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Sessions Run</span>
                  <p className="font-mono text-2xl font-black text-blue-400 mt-1">{trainerStats.totalSessions}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Students Taught</span>
                  <p className="font-mono text-2xl font-black text-emerald-400 mt-1">{trainerStats.totalStudents}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Avg Cohort Score</span>
                  <p className="font-mono text-2xl font-black text-amber-400 mt-1">{trainerStats.avgCohortScore}</p>
                </div>
              </div>

              {/* Master Excel Report Action */}
              <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Master Cumulative Excel Report</h4>
                  <p className="text-xs text-slate-300">Download multi-sheet workbook with student rosters, exam marks, and stats.</p>
                </div>
                <a
                  href="/api/export-master"
                  download="Digi_Warriors_Master_Report.xlsx"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .xlsx</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {savedNotice ? <span className="text-emerald-400 font-bold">✓ Preferences Saved!</span> : 'Settings saved locally for offline sessions'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSettings}
              type="button"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
            >
              Save Preferences
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
