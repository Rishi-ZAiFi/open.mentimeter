import React, { useEffect, useState } from 'react';
import { useQuiz } from '../../context/QuizContext';

export default function FloatingReactions() {
  const { reactions } = useQuiz();
  const [activeParticles, setActiveParticles] = useState([]);

  useEffect(() => {
    if (!reactions || reactions.length === 0) return;
    const latest = reactions[reactions.length - 1];
    if (!latest || !latest.id) return;

    const newParticle = {
      id: latest.id,
      emoji: latest.emoji,
      left: 15 + Math.random() * 70, // % from left
      size: 28 + Math.floor(Math.random() * 20), // font size px
      duration: 2.2 + Math.random() * 1.0, // seconds
      drift: (Math.random() - 0.5) * 60 // px drift
    };

    setActiveParticles(prev => [...prev.slice(-25), newParticle]);

    const timer = setTimeout(() => {
      setActiveParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, 3200);

    return () => clearTimeout(timer);
  }, [reactions]);

  if (activeParticles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {activeParticles.map(p => (
        <div
          key={p.id}
          className="absolute bottom-6 animate-floating-reaction select-none drop-shadow-lg"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            '--drift': `${p.drift}px`,
            animationDuration: `${p.duration}s`
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
}
