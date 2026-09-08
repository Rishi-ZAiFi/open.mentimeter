import React from 'react';
import { useQuiz } from '../../context/QuizContext';
import { CheckCircle2, XCircle, Trophy, Lightbulb, Zap, ArrowUp, ArrowDown, Minus } from 'lucide-react';

export default function ParticipantResultScreen() {
  const { 
    revealData, 
    lastAnswerResult, 
    selectedOption, 
    currentQuestion, 
    participantName,
    leaderboard
  } = useQuiz();

  const optionLetters = ['A', 'B', 'C', 'D'];
  const correctAnswer = revealData?.correctAnswer ?? currentQuestion?.correctAnswer;
  const isCorrect = selectedOption !== null && selectedOption === correctAnswer;
  const explanation = revealData?.explanation ?? currentQuestion?.explanation;
  const optionDist = revealData?.optionDist || [];

  // Find participant's rank from leaderboard
  const myLeaderboardEntry = leaderboard.find(p => p.name.toLowerCase() === participantName.toLowerCase());
  const myRank = myLeaderboardEntry?.currentRank || 1;
  const myDelta = myLeaderboardEntry?.rankDelta || 0;
  const myScore = myLeaderboardEntry?.score || (lastAnswerResult?.currentScore || 0);

  const basePoints = lastAnswerResult?.basePoints ?? (isCorrect ? 100 : 0);
  const speedBonus = lastAnswerResult?.speedBonus ?? 0;
  const pointsEarned = lastAnswerResult?.pointsEarned ?? (basePoints + speedBonus);

  return (
    <div className="max-w-xl mx-auto px-3 sm:px-4 py-4 sm:py-8 animate-fade-in space-y-4 sm:space-y-5">
      
      {/* Result Status Banner */}
      <div className={`p-5 sm:p-7 rounded-3xl border text-center shadow-xl animate-scale-in ${
        isCorrect 
          ? 'bg-gradient-to-b from-emerald-950/70 to-slate-900 border-emerald-500/50 text-emerald-100' 
          : selectedOption === null
          ? 'bg-slate-900 border-slate-700 text-slate-300'
          : 'bg-gradient-to-b from-rose-950/70 to-slate-900 border-rose-500/50 text-rose-100'
      }`}>
        
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
          {isCorrect ? (
            <div className="w-full h-full rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9" />
            </div>
          ) : selectedOption === null ? (
            <div className="w-full h-full rounded-2xl bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center font-bold text-lg">
              ⏱️
            </div>
          ) : (
            <div className="w-full h-full rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center">
              <XCircle className="w-9 h-9" />
            </div>
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-2">
          {isCorrect ? 'Correct!' : selectedOption === null ? 'Time Expired' : 'Incorrect'}
        </h2>

        {/* Score Breakdown Pill */}
        {isCorrect ? (
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
            <span>+{basePoints} Base</span>
            {speedBonus > 0 && (
              <>
                <span>+</span>
                <span className="flex items-center gap-0.5 text-amber-400">
                  <Zap className="w-3 h-3" />
                  {speedBonus} Speed
                </span>
              </>
            )}
            <span>=</span>
            <span className="text-white font-black">+{pointsEarned} pts</span>
          </div>
        ) : (
          <div className="text-xs text-slate-400 font-mono">
            +0 points earned
          </div>
        )}

      </div>

      {/* Participant Current Standing Card */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase font-semibold">Your Rank</span>
            <div className="font-mono text-base sm:text-lg font-black text-white flex items-center gap-1.5">
              <span>#{myRank}</span>
              {myDelta > 0 && (
                <span className="text-xs text-emerald-400 flex items-center font-bold">
                  <ArrowUp className="w-3 h-3" />+{myDelta}
                </span>
              )}
              {myDelta < 0 && (
                <span className="text-xs text-rose-400 flex items-center font-bold">
                  <ArrowDown className="w-3 h-3" />{myDelta}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase font-semibold">Total Score</span>
          <div className="font-mono text-lg sm:text-xl font-black text-blue-400">
            {myScore.toLocaleString()} <span className="text-xs font-sans text-slate-500 font-normal">pts</span>
          </div>
        </div>
      </div>

      {/* Options Distribution View */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
          Cohort Responses
        </span>

        {currentQuestion?.options?.map((opt, idx) => {
          const isThisCorrect = idx === correctAnswer;
          const isMyChoice = idx === selectedOption;
          const dist = optionDist[idx] || { count: 0, pct: 0 };

          return (
            <div
              key={idx}
              className={`relative overflow-hidden p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                isThisCorrect
                  ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-100 ring-1 ring-emerald-500/30'
                  : isMyChoice
                  ? 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300'
              }`}
            >
              <div
                className={`absolute top-0 bottom-0 left-0 ${isThisCorrect ? 'bg-emerald-500/20' : 'bg-slate-800/40'} transition-all duration-700`}
                style={{ width: `${dist.pct}%` }}
              />

              <div className="relative z-10 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 truncate">
                  <span className={`w-5 h-5 rounded-md font-bold text-xs flex items-center justify-center flex-shrink-0 ${
                    isThisCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {optionLetters[idx]}
                  </span>
                  <span className="truncate font-semibold">{opt}</span>
                  {isMyChoice && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 flex-shrink-0">
                      You
                    </span>
                  )}
                </div>

                <div className="font-mono font-bold text-white flex-shrink-0">
                  {dist.pct}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Educational Explanation Box */}
      {explanation && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 text-blue-100 flex items-start gap-2.5">
          <Lightbulb className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong className="text-blue-300 block mb-0.5">Explanation:</strong>
            {explanation}
          </div>
        </div>
      )}

      {/* Waiting Indicator */}
      <div className="text-center pt-1 text-[11px] text-slate-400 animate-pulse">
        Waiting for trainer to move to next question...
      </div>

    </div>
  );
}
