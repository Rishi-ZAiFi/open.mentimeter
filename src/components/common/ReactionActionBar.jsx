import React, { useState } from 'react';
import { useQuiz } from '../../context/QuizContext';
import { MessageSquare, Volume2, VolumeX } from 'lucide-react';
import { soundFX } from '../../services/soundEffects';

const EMOJIS = ['❤️', '👍', '🔥', '👏', '💡', '🎉'];

export default function ReactionActionBar({ onOpenQA, qaCount = 0 }) {
  const { sendReaction } = useQuiz();
  const [clickedEmoji, setClickedEmoji] = useState(null);
  const [isMuted, setIsMuted] = useState(() => soundFX.isMuted());

  const handleEmojiClick = (emoji) => {
    sendReaction(emoji);
    soundFX.playPop();
    setClickedEmoji(emoji);
    setTimeout(() => setClickedEmoji(null), 300);
  };

  const handleToggleMute = () => {
    const muted = soundFX.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 max-w-md w-[92%] sm:w-auto">
      <div className="flex items-center justify-between gap-1 sm:gap-2 px-3 py-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-full shadow-2xl">
        {/* Emoji Reactions */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleEmojiClick(emoji)}
              type="button"
              aria-label={`React with ${emoji}`}
              className={`text-xl sm:text-2xl p-1.5 rounded-full hover:bg-slate-800 active:scale-125 transition-transform duration-150 ${
                clickedEmoji === emoji ? 'scale-125 bg-blue-600/30' : ''
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>

        <div className="w-[1px] h-6 bg-slate-700 mx-1" />

        {/* Q&A Button */}
        {onOpenQA && (
          <button
            onClick={onOpenQA}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 rounded-full text-xs font-semibold border border-blue-500/30 transition-all active:scale-95"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Q&A</span>
            {qaCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                {qaCount}
              </span>
            )}
          </button>
        )}

        {/* Sound Toggle */}
        <button
          onClick={handleToggleMute}
          type="button"
          title={isMuted ? "Unmute Audio FX" : "Mute Audio FX"}
          className="p-1.5 text-slate-400 hover:text-slate-200 rounded-full hover:bg-slate-800 transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>
    </div>
  );
}
