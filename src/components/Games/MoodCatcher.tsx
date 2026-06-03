import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RefreshCcw, Heart } from 'lucide-react';

const GOOD_MOODS = ['😀', '🥰', '✨', '🌈', '💖', '⭐'];
const BAD_MOODS = ['😢', '😡', '😰', '👿', '💣'];

export const MoodCatcher = ({ onWin }: { onWin: (score: number) => void }) => {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [items, setItems] = useState<{ id: number, emoji: string, x: number, y: number, type: 'good' | 'bad' }[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const spawnItem = () => {
    if (gameOver) return;
    const isGood = Math.random() > 0.3;
    const newItem = {
      id: Date.now(),
      emoji: isGood ? GOOD_MOODS[Math.floor(Math.random() * GOOD_MOODS.length)] : BAD_MOODS[Math.floor(Math.random() * BAD_MOODS.length)],
      x: Math.random() * 80 + 10,
      y: -10,
      type: isGood ? 'good' as const : 'bad' as const
    };
    setItems(prev => [...prev, newItem]);
  };

  useEffect(() => {
    const timer = setInterval(spawnItem, 1000);
    return () => clearInterval(timer);
  }, [gameOver]);

  useEffect(() => {
    const moveTimer = setInterval(() => {
      setItems(prev => {
        const next = prev.map(item => ({ ...item, y: item.y + 2 }));
        // Check for missed good items
        next.forEach(item => {
          if (item.y > 100 && item.type === 'good') {
             // Missed good one - no penalty for now to keep it relax
          }
        });
        return next.filter(item => item.y < 110);
      });
    }, 50);
    return () => clearInterval(moveTimer);
  }, [gameOver]);

  const handleCatch = (id: number, type: 'good' | 'bad') => {
    if (type === 'good') {
      setScore(s => s + 10);
    } else {
      setLives(l => {
        if (l <= 1) {
          setGameOver(true);
          onWin(score);
          return 0;
        }
        return l - 1;
      });
    }
    setItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="relative w-full h-[400px] bg-sky-50 rounded-[2.5rem] overflow-hidden border border-sky-100 shadow-inner" ref={containerRef}>
      <div className="absolute top-4 left-4 flex gap-2 z-10">
        {[...Array(3)].map((_, i) => (
          <Heart key={i} size={20} className={i < lives ? "text-red-500 fill-red-500" : "text-gray-300"} />
        ))}
      </div>
      <div className="absolute top-4 right-4 font-black text-blue-900 z-10 bg-white/80 px-3 py-1 rounded-full text-sm">
        Score: {score}
      </div>

      <AnimatePresence>
        {items.map(item => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1, top: `${item.y}%`, left: `${item.x}%` }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => handleCatch(item.id, item.type)}
            className="absolute text-3xl p-2 cursor-pointer active:scale-125 transition-transform"
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
          >
            {item.emoji}
          </motion.button>
        ))}
      </AnimatePresence>

      {gameOver && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-20 text-center p-6">
          <Sparkles className="text-primary-pink mb-4" size={64} />
          <h3 className="text-3xl font-display text-blue-900">Game Over!</h3>
          <p className="text-gray-500 mb-8 text-lg font-medium">Final Score: {score}</p>
          <button 
            onClick={() => { setScore(0); setLives(3); setGameOver(false); setItems([]); }}
            className="bg-blue-900 text-white px-10 py-4 rounded-3xl font-bold flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            <RefreshCcw size={20} /> Play Again
          </button>
        </div>
      )}

      {items.length === 0 && !gameOver && (
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
          <p className="font-display text-lg text-blue-900 tracking-widest uppercase">Catch the Good Vibes!</p>
        </div>
      )}
    </div>
  );
};
