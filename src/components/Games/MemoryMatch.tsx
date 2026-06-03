import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RefreshCcw } from 'lucide-react';

const EMOJIS = ['🌸', '💖', '🍀', '🦋', '⭐', '🌈', '🍦', '🍓'];

export const MemoryMatch = ({ onWin }: { onWin: (score: number) => void }) => {
  const [cards, setCards] = useState<{ id: number, emoji: string, flipped: boolean, matched: boolean }[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [won, setWon] = useState(false);

  const initGame = () => {
    const doubled = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
    setCards(doubled);
    setFlipped([]);
    setMoves(0);
    setTimer(0);
    setIsActive(true);
    setWon(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    let interval: any;
    if (isActive && !won) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, won]);

  const handleFlip = (id: number) => {
    if (flipped.length === 2 || cards[id].flipped || cards[id].matched) return;

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);
    
    const newCards = [...cards];
    newCards[id].flipped = true;
    setCards(newCards);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      
      if (cards[first].emoji === cards[second].emoji) {
        newCards[first].matched = true;
        newCards[second].matched = true;
        setCards(newCards);
        setFlipped([]);
        
        if (newCards.every(c => c.matched)) {
          setWon(true);
          onWin(Math.max(10, 1000 - (timer * 5) - (moves * 10)));
        }
      } else {
        setTimeout(() => {
          newCards[first].flipped = false;
          newCards[second].flipped = false;
          setCards(newCards);
          setFlipped([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="flex justify-between w-full max-w-xs text-sm font-bold text-blue-900 bg-white p-4 rounded-2xl shadow-sm border border-pink-50">
        <span>Moves: {moves}</span>
        <span>Time: {timer}s</span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {cards.map((card) => (
          <motion.button
            key={card.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleFlip(card.id)}
            className={cn(
              "w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-3xl shadow-md transition-all duration-300",
              card.flipped || card.matched ? "bg-white border-2 border-primary-pink" : "bg-gradient-to-tr from-primary-pink to-soft-pink"
            )}
          >
            {(card.flipped || card.matched) ? card.emoji : '❓'}
          </motion.button>
        ))}
      </div>

      {won && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center p-6 bg-white rounded-3xl shadow-2xl border border-pink-50 max-w-xs w-full">
          <Sparkles className="mx-auto text-primary-pink mb-2" size={48} />
          <h3 className="text-2xl font-display text-blue-900">You Won! ✨</h3>
          <p className="text-gray-400 mb-6">Score: {Math.max(10, 1000 - (timer * 5) - (moves * 10))}</p>
          <button onClick={initGame} className="w-full bg-primary-pink text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
            <RefreshCcw size={18} /> Play Again
          </button>
        </motion.div>
      )}
    </div>
  );
};

// Simple utility for cn
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
