import React, { useState } from 'react';
import { useQuiz } from '../../context/QuizContext';
import ProgressBar from '../common/ProgressBar';
import TimerDisplay from '../common/TimerDisplay';
import ReactionActionBar from '../common/ReactionActionBar';
import QAModal from '../common/QAModal';
import WordCloudInput from './WordCloudInput';
import { CheckCircle2, Lock, Clock, Pause, Zap } from 'lucide-react';

export default function ParticipantQuestionScreen() {
  const {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    selectedOption,
    isAnswerSubmitted,
    timeRemaining,
    timerDuration,
    submitAnswer,
    sessionStatus,
    speedBonusEnabled,
    showTopic,
    qaQuestions = []
  } = useQuiz();

  const [isQAOpen, setIsQAOpen] = useState(false);

  if (!currentQuestion) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400">Loading question...</p>
      </div>
    );
  }

  const optionLetters = ['A', 'B', 'C', 'D'];
  const optionThemes = [
    {
      card: 'border-blue-500/40 bg-blue-950/30 hover:border-blue-500 active:bg-blue-900/50',
      activeCard: 'border-blue-400 bg-blue-600 text-white shadow-xl shadow-blue-500/30 ring-2 ring-blue-400/50',
      badge: 'bg-blue-600 text-white',
      activeBadge: 'bg-white text-blue-700'
    },
    {
      card: 'border-emerald-500/40 bg-emerald-950/30 hover:border-emerald-500 active:bg-emerald-900/50',
      activeCard: 'border-emerald-400 bg-emerald-600 text-white shadow-xl shadow-emerald-500/30 ring-2 ring-emerald-400/50',
      badge: 'bg-emerald-600 text-white',
      activeBadge: 'bg-white text-emerald-700'
    },
    {
      card: 'border-amber-500/40 bg-amber-950/30 hover:border-amber-500 active:bg-amber-900/50',
      activeCard: 'border-amber-400 bg-amber-600 text-white shadow-xl shadow-amber-500/30 ring-2 ring-amber-400/50',
      badge: 'bg-amber-600 text-white',
      activeBadge: 'bg-white text-amber-700'
    },
    {
      card: 'border-rose-500/40 bg-rose-950/30 hover:border-rose-500 active:bg-rose-900/50',
      activeCard: 'border-rose-400 bg-rose-600 text-white shadow-xl shadow-rose-500/30 ring-2 ring-rose-400/50',
      badge: 'bg-rose-600 text-white',
      activeBadge: 'bg-white text-rose-700'
    },
    {
      card: 'border-purple-500/40 bg-purple-950/30 hover:border-purple-500 active:bg-purple-900/50',
      activeCard: 'border-purple-400 bg-purple-600 text-white shadow-xl shadow-purple-500/30 ring-2 ring-purple-400/50',
      badge: 'bg-purple-600 text-white',
      activeBadge: 'bg-white text-purple-700'
    },
    {
      card: 'border-cyan-500/40 bg-cyan-950/30 hover:border-cyan-500 active:bg-cyan-900/50',
      activeCard: 'border-cyan-400 bg-cyan-600 text-white shadow-xl shadow-cyan-500/30 ring-2 ring-cyan-400/50',
      badge: 'bg-cyan-600 text-white',
      activeBadge: 'bg-white text-cyan-700'
    }
  ];

  // Dynamic color shift per question so colors are completely random/varied across questions
  const qSeed = (currentQuestion.id || (currentQuestionIndex + 1)) * 7;

  return (
    <div className="max-w-xl mx-auto px-3 sm:px-4 py-4 sm:py-8 animate-fade-in flex flex-col justify-between min-h-[calc(100dvh-4.5rem)] select-none">
      
      {/* Top Header: Progress & Timer */}
      <div>
        <ProgressBar
          current={currentQuestionIndex}
          total={totalQuestions}
          category={showTopic ? currentQuestion.category : null}
          difficulty={currentQuestion.difficulty}
        />

        {/* Status Bar */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-1.5">
            {speedBonusEnabled && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Zap className="w-3 h-3" />
                <span>Speed Bonus Active</span>
              </span>
            )}
          </div>
          
          <TimerDisplay timeRemaining={timeRemaining} totalDuration={timerDuration} />
        </div>

        {/* Paused Overlay Notice */}
        {sessionStatus === 'paused' && (
          <div className="mb-4 p-3.5 rounded-2xl bg-purple-950/60 border border-purple-500/40 text-purple-200 flex items-center gap-2.5 animate-pulse text-xs sm:text-sm font-semibold">
            <Pause className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span>Quiz paused by trainer.</span>
          </div>
        )}

        {currentQuestion.type === 'wordcloud' ? (
          <WordCloudInput question={currentQuestion} />
        ) : (
          <>
            {/* Large Readable Question Card */}
            <div className="p-5 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl mb-4 sm:mb-6">
              <h2 className="text-base sm:text-xl md:text-2xl font-black text-white leading-snug tracking-tight">
                {currentQuestion.question}
              </h2>
            </div>

            {/* 4 Large Touch-Optimized Option Buttons with Dynamic Varied Colors */}
            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options?.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const themeIndex = (idx + qSeed) % optionThemes.length;
                const theme = optionThemes[themeIndex];

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswerSubmitted || sessionStatus === 'paused'}
                    onClick={() => submitAnswer(idx)}
                    style={{ touchAction: 'manipulation' }}
                    className={`relative w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-150 flex items-center gap-3.5 sm:gap-4 ${
                      isSelected
                        ? theme.activeCard
                        : isAnswerSubmitted
                        ? 'bg-slate-950/40 border-slate-800/80 text-slate-500 cursor-not-allowed opacity-50'
                        : `${theme.card} text-slate-100 active:scale-[0.98]`
                    }`}
                  >
                    {/* Option Letter Badge */}
                    <div
                      className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-black text-sm sm:text-base shadow-md flex-shrink-0 transition-transform ${
                        isSelected ? theme.activeBadge : theme.badge
                      }`}
                    >
                      {optionLetters[idx]}
                    </div>

                    {/* Option Text */}
                    <span className={`text-sm sm:text-base font-bold leading-snug flex-1 ${
                      isSelected ? 'text-white' : 'text-slate-100'
                    }`}>
                      {opt}
                    </span>

                    {/* Selected Checkmark */}
                    {isSelected && (
                      <CheckCircle2 className="w-6 h-6 text-white flex-shrink-0 animate-scale-in" />
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Answer Submitted Sticky Feedback */}
      {isAnswerSubmitted && currentQuestion.type !== 'wordcloud' && (
        <div className="mt-6 mb-16 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 flex items-center justify-center gap-2.5 animate-slide-up shadow-xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="font-extrabold text-xs sm:text-sm">
            Answer submitted ✓ &bull; Waiting for results...
          </span>
        </div>
      )}

      {/* Real-Time Reaction Bar & Q&A Trigger */}
      <ReactionActionBar onOpenQA={() => setIsQAOpen(true)} qaCount={qaQuestions.length} />

      {/* Audience Q&A Modal */}
      <QAModal isOpen={isQAOpen} onClose={() => setIsQAOpen(false)} />

    </div>
  );
}
