import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, RefreshCcw } from 'lucide-react';

export const ReflexTap = ({ onWin }: { onWin: (score: number) => void }) => {
  const [target, setTarget] = useState<{ x: number, y: number } | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isActive, setIsActive] = useState(false);
  const [finished, setFinished] = useState(false);

  const spawnTarget = () => {
    setTarget({
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10
    });
  };

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setFinished(true);
      onWin(score);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsActive(true);
    setFinished(false);
    spawnTarget();
  };

  const handleTap = () => {
    if (!isActive) return;
    setScore(s => s + 1);
    spawnTarget();
  };

  return (
    <div className="relative w-full h-[400px] bg-indigo-50 rounded-[2.5rem] overflow-hidden border border-indigo-100 shadow-inner flex flex-col items-center justify-center">
      <div className="absolute top-4 left-6 right-6 flex justify-between items-center z-10">
        <div className="bg-white/80 px-4 py-2 rounded-2xl shadow-sm text-indigo-900 font-bold flex items-center gap-2">
           <Zap size={16} /> {score}
        </div>
        <div className="bg-white/80 px-4 py-2 rounded-2xl shadow-sm text-indigo-900 font-bold">
           Time: {timeLeft}s
        </div>
      </div>

      <AnimatePresence>
        {isActive && target && (
          <motion.button
            key={`${target.x}-${target.y}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={handleTap}
            className="absolute w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-200 border-4 border-white"
            style={{ left: `${target.x}%`, top: `${target.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <Zap size={32} />
          </motion.button>
        )}
      </AnimatePresence>

      {!isActive && !finished && (
        <div className="text-center p-8 space-y-6">
          <Zap size={64} className="text-indigo-400 mx-auto" />
          <h3 className="text-2xl font-display text-blue-900">Reflex Tap</h3>
          <p className="text-gray-500 max-w-xs mx-auto">Ketuk target secepat mungkin sebelum waktu habis!</p>
          <button 
            onClick={startGame}
            className="w-full bg-indigo-500 text-white py-4 rounded-3xl font-bold font-display tracking-widest shadow-xl shadow-indigo-100 hover:scale-105 transition-all"
          >
            MULAI GAME
          </button>
        </div>
      )}

      {finished && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-20 text-center p-6 space-y-4">
          <h3 className="text-4xl font-display text-blue-900">Waktu Habis!</h3>
          <p className="text-gray-500 font-bold uppercase tracking-widest">Skor Akhir</p>
          <div className="text-6xl font-black text-indigo-600 mb-8">{score}</div>
          <button 
            onClick={startGame}
            className="bg-indigo-500 text-white px-10 py-5 rounded-3xl font-bold flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            <RefreshCcw size={20} /> Coba Lagi
          </button>
        </div>
      )}
    </div>
  );
};
