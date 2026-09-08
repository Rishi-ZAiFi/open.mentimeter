import React, { useState } from 'react';
import { useQuiz } from '../../context/QuizContext';
import {
  Play,
  Pause,
  ArrowRight,
  Eye,
  Trophy,
  Users,
  CheckCircle2,
  HelpCircle,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  Plus
} from 'lucide-react';
import { soundFX } from '../../services/soundEffects';

export default function TrainerRemote() {
  const {
    sessionCode,
    sessionStatus,
    questionState,
    currentQuestionIndex,
    totalQuestions,
    timeRemaining,
    currentQuestion,
    liveAnswerCount,
    participants,
    nextQuestion,
    revealAnswers,
    pauseTimer,
    resumeTimer,
    showLeaderboard,
    finishQuiz,
    isShowingLeaderboard
  } = useQuiz();

  const [isMuted, setIsMuted] = useState(() => soundFX.isMuted());
  const isWordCloud = currentQuestion?.type === 'wordcloud';

  const handleToggleMute = () => {
    const muted = soundFX.toggleMute();
    setIsMuted(muted);
  };

  const answeredCount = liveAnswerCount?.answeredCount || 0;
  const totalCount = participants.length || liveAnswerCount?.totalParticipants || 0;
  const progressPercent = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 max-w-md mx-auto select-none">
      {/* Top HUD */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-sm tracking-wider text-slate-200">MENTIMOTE REMOTE</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleMute}
              type="button"
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <span className="px-2.5 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-mono font-bold">
              {sessionCode || 'OFFLINE'}
            </span>
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-800">
          <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Slide / Q</span>
            <p className="text-base font-black text-slate-100">
              {currentQuestionIndex + 1}<span className="text-xs text-slate-500">/{totalQuestions}</span>
            </p>
          </div>
          <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Timer</span>
            <p className={`text-base font-black ${timeRemaining <= 5 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`}>
              {timeRemaining}s
            </p>
          </div>
          <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Answered</span>
            <p className="text-base font-black text-emerald-400">
              {answeredCount}<span className="text-xs text-slate-500">/{totalCount}</span>
            </p>
          </div>
        </div>

        {/* Submission Progress bar */}
        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
          <div
            className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Glanceable Presenter Card (Question & Notes) */}
      <div className="my-4 flex-1 bg-slate-900/70 border border-slate-800 rounded-2xl p-4 shadow-xl overflow-y-auto space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
          <HelpCircle className="w-4 h-4" />
          <span>PRESENTER HUD • {isWordCloud ? 'WORD CLOUD' : 'MCQ QUESTION'}</span>
        </div>

        <p className="text-sm font-bold text-slate-100 leading-snug">
          {currentQuestion?.question || 'Waiting for session to begin...'}
        </p>

        {/* Correct Option Preview for Trainer */}
        {!isWordCloud && currentQuestion?.options && (
          <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Correct Answer:
            </span>
            <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs font-medium text-emerald-200">
              {currentQuestion.options[currentQuestion.correctAnswer]}
            </div>
          </div>
        )}

        {/* Speaker notes / explanation */}
        {currentQuestion?.explanation && (
          <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-300">Explanation Note: </span>
            {currentQuestion.explanation}
          </div>
        )}
      </div>

      {/* Big Action Buttons for Trainer Thumb Control */}
      <div className="space-y-3 pb-2">
        {/* Primary Action Button */}
        {questionState === 'active' && !isShowingLeaderboard ? (
          <button
            onClick={revealAnswers}
            type="button"
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white font-extrabold rounded-2xl text-lg shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3 transition-all"
          >
            <Eye className="w-6 h-6" />
            <span>REVEAL ANSWERS</span>
          </button>
        ) : (
          <button
            onClick={nextQuestion}
            type="button"
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-extrabold rounded-2xl text-lg shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-3 transition-all"
          >
            <span>NEXT QUESTION</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        )}

        {/* Secondary Action Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={sessionStatus === 'paused' ? resumeTimer : pauseTimer}
            type="button"
            className="py-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold rounded-xl text-sm border border-slate-700 flex items-center justify-center gap-2 transition-all"
          >
            {sessionStatus === 'paused' ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
            <span>{sessionStatus === 'paused' ? 'Resume Timer' : 'Pause Timer'}</span>
          </button>

          <button
            onClick={showLeaderboard}
            type="button"
            className="py-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold rounded-xl text-sm border border-slate-700 flex items-center justify-center gap-2 transition-all"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Leaderboard</span>
          </button>
        </div>

        {/* End Session Button */}
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to end this exam and show final results?')) {
              finishQuiz();
            }
          }}
          type="button"
          className="w-full py-2.5 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 font-semibold rounded-xl text-xs border border-rose-500/30 transition-all text-center"
        >
          End Session & Show Final Podium
        </button>
      </div>
    </div>
  );
}
