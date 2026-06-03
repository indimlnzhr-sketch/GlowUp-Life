import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind, Heart } from 'lucide-react';

export const CalmBreathing = ({ onComplete }: { onComplete: (score: number) => void }) => {
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Ready'>('Ready');
  const [timer, setTimer] = useState(0);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const phases = {
    Inhale: { duration: 4, text: 'Tarik Napas Pelan...', color: 'bg-blue-400', scale: 1.5 },
    Hold: { duration: 4, text: 'Tahan...', color: 'bg-pink-400', scale: 1.5 },
    Exhale: { duration: 8, text: 'Hembuskan Perlahan...', color: 'bg-indigo-400', scale: 1.0 },
  };

  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => {
        setTimer(t => {
          if (t >= (phases[phase as keyof typeof phases]?.duration || 0)) {
            if (phase === 'Inhale') setPhase('Hold');
            else if (phase === 'Hold') setPhase('Exhale');
            else if (phase === 'Exhale') {
              setPhase('Inhale');
              setCompletedCycles(c => c + 1);
            }
            return 1;
          }
          return t + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, phase]);

  const start = () => {
    setPhase('Inhale');
    setTimer(0);
    setIsActive(true);
  };

  const stop = () => {
    setIsActive(false);
    onComplete(completedCycles * 10);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
      <AnimatePresence mode="wait">
        {!isActive ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-400">
              <Wind size={48} />
            </div>
            <h3 className="text-2xl font-display text-blue-900">Relaksasi Pernapasan</h3>
            <p className="text-gray-500 max-w-xs">Sisihkan waktu sejenak untuk menenangkan pikiranmu dengan teknik 4-4-8.</p>
            <button 
              onClick={start}
              className="w-full bg-blue-900 text-white py-5 rounded-[2rem] font-bold text-lg shadow-xl shadow-blue-100 transition-all hover:scale-[1.02] active:scale-95"
            >
              Mulai Sesi
            </button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-12 w-full">
            <div className="relative">
              <motion.div
                animate={{ 
                  scale: phases[phase as keyof typeof phases]?.scale || 1,
                  backgroundColor: phases[phase as keyof typeof phases]?.color || '#3b82f6'
                }}
                transition={{ duration: phases[phase as keyof typeof phases]?.duration || 4, ease: "easeInOut" }}
                className="w-32 h-32 rounded-full shadow-2xl opacity-40"
              />
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                 <p className="text-blue-900 font-black text-4xl">{timer}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-2xl font-bold text-blue-900">{phases[phase as keyof typeof phases]?.text}</h4>
              <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs">Siklus Selesai: {completedCycles}</p>
            </div>

            <button 
              onClick={stop}
              className="bg-red-50 text-red-500 px-8 py-3 rounded-2xl font-bold border border-red-100 hover:bg-red-500 hover:text-white transition-all shadow-sm"
            >
              Akhiri Sesi
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
