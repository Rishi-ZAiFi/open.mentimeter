import React, { useState, useEffect, useCallback } from 'react';
import { socket } from '../../services/socket';
import { soundEngine } from '../../services/soundEffects';

const EMOJI_OPTIONS = [
  { emoji: '❤️', label: 'Love' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '👏', label: 'Clap' },
  { emoji: '💡', label: 'Insight' },
  { emoji: '🚀', label: 'Rocket' },
  { emoji: '😂', label: 'Laugh' }
];

export function FloatingReactionsOverlay({ isTrainer = false }) {
  const [particles, setParticles] = useState([]);

  const addParticle = useCallback((emoji) => {
    const id = `${Date.now()}-${Math.random()}`;
    const leftPercent = 65 + Math.random() * 30; // Float on right side (65% to 95%)
    const size = 28 + Math.random() * 20; // 28px - 48px
    const duration = 2.5 + Math.random() * 1.5; // 2.5s - 4.0s
    const drift = (Math.random() - 0.5) * 60; // -30px to +30px drift

    if (isTrainer) {
      soundEngine.playPop();
    }

    setParticles(prev => [
      ...prev.slice(-25), // Keep max 25 active on screen
      { id, emoji, leftPercent, size, duration, drift }
    ]);

    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== id));
    }, duration * 1000);
  }, [isTrainer]);

  useEffect(() => {
    const handleReaction = ({ emoji }) => {
      if (emoji) {
        addParticle(emoji);
      }
    };

    socket.on('reaction_received', handleReaction);
    return () => socket.off('reaction_received', handleReaction);
  }, [addParticle]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map(p => (
        <span
          key={p.id}
          className="absolute select-none animate-float-emoji"
          style={{
            bottom: '20px',
            left: `${p.leftPercent}%`,
            fontSize: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            '--drift': `${p.drift}px`
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

export function ParticipantReactionDock({ sessionCode }) {
  const [cooldown, setCooldown] = useState(false);

  const sendEmoji = (emoji) => {
    if (cooldown || !sessionCode) return;
    
    soundEngine.playPop();
    socket.emit('send_reaction', { sessionCode, emoji });
    
    setCooldown(true);
    setTimeout(() => setCooldown(false), 250); // Fast 250ms burst cooldown
  };

  return (
    <div className="flex items-center justify-center gap-1.5 p-2 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
      {EMOJI_OPTIONS.map(({ emoji, label }) => (
        <button
          key={emoji}
          type="button"
          onClick={() => sendEmoji(emoji)}
          title={`Send ${label}`}
          className="w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-125 hover:scale-110 flex items-center justify-center text-xl transition-all duration-150 transform"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

export default FloatingReactionsOverlay;

