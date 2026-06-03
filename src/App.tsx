import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  MessageCircle, 
  Activity, 
  ShieldAlert, 
  User, 
  Sparkles,
  Plus,
  ArrowRight,
  LogOut,
  Settings,
  Heart,
  Droplets,
  Moon,
  Wallet,
  CheckCircle2,
  Bell,
  Gamepad2,
  Trash2,
  ChevronRight,
  Phone,
  Edit2,
  BrainCircuit,
  Star,
  Wind,
  Zap,
  Trophy,
  Camera,
  Flame
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Toaster, toast } from 'react-hot-toast';
import { useReminders } from './hooks/useReminders';
import './i18n/config';
import { supabase, isConfigured } from './lib/supabase';
import { cn } from './lib/utils';

// --- Hooks ---
import { useHabits } from './hooks/useHabits';
import { useMood } from './hooks/useMood';
import { useSavings } from './hooks/useSavings';
import { useSafety } from './hooks/useSafety';
import { useGames } from './hooks/useGames';

// --- Games ---
import { MemoryMatch } from './components/Games/MemoryMatch';
import { MoodCatcher } from './components/Games/MoodCatcher';
import { CalmBreathing } from './components/Games/CalmBreathing';
import { ReflexTap } from './components/Games/ReflexTap';



// --- Widgets ---



const TabunganWidget = () => {
  const [data, setData] = useState(() => JSON.parse(localStorage.getItem('tabungan_data') || '{"transactions": [], "goal": 1000000}'));
  const [amountInput, setAmountInput] = useState('');
  const [descInput, setDescInput] = useState('');

  const saveToStorage = (newData: any) => {
    localStorage.setItem('tabungan_data', JSON.stringify(newData));
    setData(newData);
  };

  const addTransaction = (type: 'income' | 'expense') => {
    if (!amountInput || !descInput) return;
    const newTrans = { id: Date.now(), amount: amountInput, desc: descInput, type, date: new Date().toLocaleDateString() };
    saveToStorage({ ...data, transactions: [...data.transactions, newTrans] });
    setAmountInput('');
    setDescInput('');
  };

  const totalAmount = data.transactions.reduce((acc: number, t: any) => t.type === 'income' ? acc + Number(t.amount) : acc - Number(t.amount), 0);
  const percentage = Math.min(100, (totalAmount / data.goal) * 100);

  return (
    <section className="p-8 bg-white rounded-[3rem] border border-blue-50 shadow-xl shadow-gray-100">
      <h3 className="text-md font-black text-blue-900 uppercase tracking-widest leading-none mb-6">Tabungan Saya</h3>
      <div className="text-center mb-6">
        <p className="text-xs text-gray-400 font-bold uppercase">Total Uang</p>
        <div className="text-4xl font-black text-indigo-500">Rp {totalAmount.toLocaleString()}</div>
        <div className="w-full mt-4 h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} className="h-full bg-indigo-500" />
        </div>
      </div>
      <div className="space-y-2 mb-6">
        <input type="number" placeholder="Nominal (Misal: 50000)" value={amountInput} onChange={e => setAmountInput(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl" />
        <input type="text" placeholder="Catatan (Misal: Uang Jajan)" value={descInput} onChange={e => setDescInput(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl" />
        <div className="flex gap-2">
          <button onClick={() => addTransaction('income')} className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors">+ Pemasukan</button>
          <button onClick={() => addTransaction('expense')} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors">- Pengeluaran</button>
        </div>
      </div>
      {data.transactions.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="font-bold text-sm text-gray-400 uppercase tracking-widest">Riwayat</h4>
            {data.transactions.map((t: any) => (
                <div key={t.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                        <p className="font-bold text-gray-700">{t.desc}</p>
                        <p className="text-xs text-gray-400">{t.date}</p>
                    </div>
                    <span className={cn("font-bold", t.type === 'income' ? "text-green-500" : "text-red-500")}>
                        {t.type === 'income' ? '+' : '-'} Rp {Number(t.amount).toLocaleString()}
                    </span>
                </div>
            ))}
          </div>
      )}
    </section>
  );
};



const ViewWrapper = ({ children, className, viewKey }: { children: React.ReactNode, className?: string, viewKey?: React.Key }) => (
  <motion.div
    key={viewKey}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
    className={cn("flex-1 p-6 overflow-y-auto no-scrollbar", className)}
  >
    {children}
  </motion.div>
);

const DesktopSidebar = ({ active, onChange }: { active: string, onChange: (v: string) => void }) => {
  const { t } = useTranslation();
  const tabs = [
    { id: 'home', icon: Home, label: t('navbar.home') },
    { id: 'ai', icon: MessageCircle, label: t('navbar.ai') },
    { id: 'trackers', icon: Activity, label: t('navbar.trackers') },
    { id: 'games', icon: Gamepad2, label: 'Games' },
    { id: 'profile', icon: User, label: t('navbar.profile') },
  ];

  return (
    <aside className="hidden md:flex w-20 flex-col items-center gap-4 py-6 bg-white/80 rounded-[2.5rem] border border-pink-100 shadow-xl shadow-pink-50 h-[calc(100vh-120px)] my-auto ml-6 shrink-0">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
              isActive ? "bg-primary-pink text-white shadow-lg shadow-primary-pink/30" : "text-gray-400 hover:bg-pink-50 hover:text-primary-pink"
            )}
          >
            <Icon size={24} />
          </button>
        );
      })}
    </aside>
  );
};

const TopNav = ({ session, onLogout }: { session: any, onLogout: () => void }) => {
  const user = session?.user;

  const [userName, setUserName] = useState(() => localStorage.getItem('user_name') || user?.email?.split('@')[0] || 'Tamu');
  const [profileImage, setProfileImage] = useState(() => localStorage.getItem('profile_image') || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`);

  useEffect(() => {
    const handleProfileUpdate = () => {
      setUserName(localStorage.getItem('user_name') || user?.email?.split('@')[0] || 'Tamu');
      setProfileImage(localStorage.getItem('profile_image') || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`);
    };
    window.addEventListener('profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('profile-updated', handleProfileUpdate);
  }, [user]);

  return (
    <nav className="h-16 px-8 flex items-center justify-between bg-white/60 backdrop-blur-md border-b border-pink-100 shrink-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-tr from-primary-pink to-sky-blue rounded-xl flex items-center justify-center shadow-lg shadow-pink-200">
          <Sparkles className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold tracking-tight text-primary-pink">GlowUp <span className="text-sky-blue">Life</span></span>
      </div>
      
      <div className="flex items-center gap-4 md:gap-8">
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-gray-700">{userName}</p>
              <button onClick={onLogout} className="text-[10px] text-red-400 font-bold hover:text-red-500 transition-colors uppercase tracking-widest">Logout</button>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-sky-blue p-0.5 relative group cursor-pointer" onClick={onLogout}>
              <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden">
                <img src={profileImage} alt="profile" className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-red-500/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <LogOut size={16} className="text-white" />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const Navbar = ({ active, onChange }: { active: string, onChange: (v: string) => void }) => {
  const { t } = useTranslation();
  const tabs = [
    { id: 'home', icon: Home, label: t('navbar.home') },
    { id: 'ai', icon: MessageCircle, label: t('navbar.ai') },
    { id: 'trackers', icon: Activity, label: t('navbar.trackers') },
    { id: 'games', icon: Gamepad2, label: 'Games' },
    { id: 'profile', icon: User, label: t('navbar.profile') },
  ];

  return (
    <nav className="md:hidden fixed bottom-6 left-6 right-6 glass p-2 rounded-[2rem] border border-pink-100 shadow-2xl z-50 flex justify-around items-center">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative p-3 rounded-2xl transition-all duration-300",
              isActive ? "bg-primary-pink text-white shadow-lg shadow-primary-pink/30" : "text-gray-400"
            )}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
          </button>
        );
      })}
    </nav>
  );
};

// --- Views ---

const Onboarding = ({ onComplete }: { onComplete: () => void }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  
  const slides = [
    { title: t('welcome'), desc: t('onboarding.slide1'), color: 'from-pink-100 to-pink-50', icon: Sparkles },
    { title: t('tagline'), desc: t('onboarding.slide2'), color: 'from-blue-100 to-blue-50', icon: Heart },
    { title: 'GlowUp AI', desc: t('onboarding.slide3'), color: 'from-indigo-100 to-indigo-50', icon: MessageCircle },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-[#fdf2f8] flex flex-col items-center justify-center p-8 text-center overscroll-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="flex flex-col items-center gap-8 max-w-sm"
        >
          <div className={cn("w-72 h-72 rounded-[3.5rem] flex items-center justify-center bg-gradient-to-br shadow-2xl shadow-pink-100", slides[step].color)}>
            {(() => {
              const Icon = slides[step].icon;
              return <Icon size={100} className="text-white drop-shadow-lg" />;
            })()}
          </div>
          <div>
            <h1 className="text-4xl font-display text-blue-900 mb-4 tracking-tight">{slides[step].title}</h1>
            <p className="text-gray-500 text-lg leading-relaxed">{slides[step].desc}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-16 flex gap-3">
        {slides.map((_, i) => (
          <div key={i} className={cn("h-3 rounded-full transition-all duration-500", i === step ? "w-12 bg-primary-pink" : "w-3 bg-pink-100")} />
        ))}
      </div>

      <div className="mt-16 w-full max-w-xs flex flex-col gap-4">
        <button 
          onClick={() => step < slides.length - 1 ? setStep(step + 1) : onComplete()}
          className="w-full bg-primary-pink text-white py-5 rounded-[2rem] font-bold text-lg shadow-xl shadow-primary-pink/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
        >
          {step === slides.length - 1 ? "Let's GlowUp" : "Lanjutkan"} <ArrowRight size={24} />
        </button>
        {step < slides.length - 1 && (
          <button onClick={onComplete} className="text-blue-400 font-bold tracking-widest uppercase text-xs">Skip onboarding</button>
        )}
      </div>
    </div>
  );
};

const HomeView: React.FC<{ 
  session: any, 
  onTabChange: (tab: string) => void,
  logs: any[],
  addMood: (emoji: string, label: string) => void,
  savings: any[],
  updateAmount: (id: string, amount: number) => void
}> = ({ session, onTabChange, logs, addMood, savings, updateAmount }) => {
  const { t } = useTranslation();
  
  const [userName, setUserName] = useState(() => localStorage.getItem('user_name') || session.user.email?.split('@')[0] || 'Tamu');

  // New States for Home
  const [waterGlasses, setWaterGlasses] = useState(() => parseInt(localStorage.getItem('water_glasses') || '0', 10));
  const [waterStreak, setWaterStreak] = useState(() => parseInt(localStorage.getItem('water_streak') || '0', 10));
  const [lastWaterDate, setLastWaterDate] = useState(() => localStorage.getItem('last_water_date') || '');
  
  const [skincare, setSkincare] = useState(() => JSON.parse(localStorage.getItem('skincare') || '{"pagi": {"w": false, "t": false, "m": false, "s": false}, "malam": {"d": false, "t": false, "s": false, "m": false}}'));
  const [dietRestrictions, setDietRestrictions] = useState(() => JSON.parse(localStorage.getItem('diet_rest') || '{"minyak": false, "manis": false, "tepung": false}'));
  const [foodLogs, setFoodLogs] = useState(() => JSON.parse(localStorage.getItem('food_logs') || '[]'));
  const [foodNote, setFoodNote] = useState('');
  const [foodCal, setFoodCal] = useState('');
  const [editingItem, setEditingItem] = useState<{ type: 'food', id: number, note?: string, cal?: string } | null>(null);

  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedFood, setDetectedFood] = React.useState<{ note: string; cal: number; image: string } | null>(null);
  const [foodImage, setFoodImage] = React.useState<string | null>(null);
  const foodCameraInputRef = useRef<HTMLInputElement>(null);

  const workoutLogs = JSON.parse(localStorage.getItem('workout_logs') || '[]');

  const handleWaterClick = (num: number) => {
      setWaterGlasses(num);
      const today = new Date().toLocaleDateString('en-CA');
      
      if (num === 8 && lastWaterDate !== today) {
         let newStreak = waterStreak;
         const yesterday = new Date();
         yesterday.setDate(yesterday.getDate() - 1);
         if (lastWaterDate === yesterday.toLocaleDateString('en-CA')) {
             newStreak += 1;
         } else {
             newStreak = 1;
         }
         setWaterStreak(newStreak);
         setLastWaterDate(today);
         
         // Immediately save the streak
         localStorage.setItem('water_streak', newStreak.toString());
         localStorage.setItem('last_water_date', today);
      }
  };

  useEffect(() => {
    localStorage.setItem('water_glasses', waterGlasses.toString());
  }, [waterGlasses]);

  useEffect(() => {
        localStorage.setItem('skincare', JSON.stringify(skincare));
        localStorage.setItem('diet_rest', JSON.stringify(dietRestrictions));
        localStorage.setItem('food_logs', JSON.stringify(foodLogs));
  }, [skincare, dietRestrictions, foodLogs]);

  useEffect(() => {
    const handleProfileUpdate = () => {
      setUserName(localStorage.getItem('user_name') || session.user.email?.split('@')[0] || 'Tamu');
    };
    window.addEventListener('profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('profile-updated', handleProfileUpdate);
  }, [session.user]);

  const addFood = () => {
      if (!foodNote.trim() || !foodCal.trim()) return;
      if (editingItem && editingItem.type === 'food') {
          setFoodLogs(foodLogs.map((item: any) => item.id === editingItem.id ? { ...item, note: foodNote, cal: foodCal } : item));
          setEditingItem(null);
      } else {
          setFoodLogs([{ id: Date.now(), note: foodNote, cal: foodCal, date: new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }, ...foodLogs]);
      }
      setFoodNote('');
      setFoodCal('');
  };

  const handleFoodCameraUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const imageUrl = URL.createObjectURL(file);
          setFoodImage(imageUrl);
          
          setIsDetecting(true);
          
          // Realistic simulation
          setTimeout(() => {
              let foodName = "Dimsum Mentai";
              let foodCal = 350;
              
              const fileNameLower = file.name.toLowerCase();
              if (fileNameLower.includes("salad") || fileNameLower.includes("sayur")) {
                  foodName = "Salad Sayur";
                  foodCal = 150;
              } else if (fileNameLower.includes("goreng") || fileNameLower.includes("nasgor")) {
                  foodName = "Nasi Goreng Ayam";
                  foodCal = 450;
              }
              
              setDetectedFood({ note: foodName, cal: foodCal, image: imageUrl });
              setIsDetecting(false);
          }, 2000);
      }
  };

  const editFood = (item: any) => {
      setEditingItem({ ...item, type: 'food' });
      setFoodNote(item.note);
      setFoodCal(item.cal);
  };

  // Calculate calories
  const todayStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const kaloriMasuk = foodLogs.filter((log: any) => log.date === todayStr || !log.date).reduce((acc: number, log: any) => acc + parseInt(log.cal || '0', 10), 0) || 0;
  const kaloriKeluar = workoutLogs.filter((log: any) => log.date?.includes(new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })) || !log.date).length * 300;
  
  const targetKalori = 2000;
  const sisaKalori = targetKalori - kaloriMasuk + kaloriKeluar;

  const kaloriMasukPct = Math.min((kaloriMasuk / targetKalori) * 100, 100);

  return (
    <ViewWrapper viewKey="home" className="space-y-6 pb-32">
      <header className="bg-white/40 p-4 rounded-3xl md:hidden">
        <h1 className="text-xl font-display">Halo {userName}! ✨</h1>
      </header>
      
      {/* Ringkasan Kalori Harian */}
      <section className="bg-white rounded-[3rem] p-10 border border-gray-50 shadow-sm flex flex-col gap-6 relative">
         <div className="flex justify-between items-center">
             <h3 className="text-2xl font-display text-blue-900">Ringkasan Kalori</h3>
             <button onClick={() => foodCameraInputRef.current?.click()} className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-[1.5rem] flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all shadow-sm">
                 <Camera size={24} />
             </button>
             <input type="file" ref={foodCameraInputRef} onChange={handleFoodCameraUpload} accept="image/*" className="hidden" />
         </div>
         
         {foodImage && (
             <div className="mt-2 w-24 h-24 rounded-xl overflow-hidden border-2 border-indigo-100 shadow-inner">
                 <img src={foodImage} alt="Preview" className="w-full h-full object-cover" />
             </div>
         )}
         
         {isDetecting && (
             <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 rounded-[3rem] flex items-center justify-center">
                 <div className="bg-white px-6 py-3 rounded-full shadow-lg font-bold text-indigo-500 flex items-center gap-2">
                     <Sparkles className="animate-spin" size={20} /> Mendeteksi makanan...
                 </div>
             </div>
         )}
         
         <div className="flex justify-between items-end bg-gray-50 p-6 rounded-3xl">
            <div>
              <p className="text-5xl font-black text-gray-800 tracking-tighter">{sisaKalori}</p>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-2">Sisa Kuota <span className="lowercase normal-case font-bold text-gray-400">(kcal)</span></p>
            </div>
            <div className="text-right space-y-1">
              <div className="bg-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-gray-400 w-12 text-left">Masuk</span>
                  <span className="text-sm font-black text-emerald-500">{kaloriMasuk}</span>
              </div>
              <div className="bg-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-gray-400 w-12 text-left">Keluar</span>
                  <span className="text-sm font-black text-orange-500">{kaloriKeluar}</span>
              </div>
            </div>
         </div>
         
         <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden shadow-inner p-1">
            <div className="h-full bg-gradient-to-r from-emerald-300 to-emerald-500 rounded-full transition-all duration-1000 relative" style={{ width: `${kaloriMasukPct}%` }}>
               <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 w-full h-full transform skew-x-[-20deg]"></div>
            </div>
         </div>
      </section>

      {/* Pengingat Minum Air */}
      <section className={cn("rounded-[3rem] p-8 border shadow-sm flex flex-col items-center relative overflow-hidden transition-colors duration-500", waterGlasses >= 8 ? "bg-sky-500 border-sky-400" : "bg-white border-sky-50")}>
         {waterGlasses >= 8 && (
             <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
         )}
         
         <div className="flex items-center gap-2 mb-4 relative z-10">
             <Droplets className={waterGlasses >= 8 ? "text-white" : "text-sky-400"} />
             <h3 className={cn("text-xl font-display", waterGlasses >= 8 ? "text-white" : "text-blue-900")}>Pengingat Minum Air</h3>
         </div>
         
         {waterGlasses >= 8 ? (
             <div className="flex flex-col items-center mb-6 relative z-10 animate-bounce cursor-default">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/30 text-white shadow-lg">
                    <Flame className="text-yellow-300 fill-yellow-300 animate-pulse" />
                    <span className="font-black tracking-widest uppercase text-sm">Minum Streak {waterStreak} Hari!</span>
                </div>
             </div>
         ) : (
             <p className="text-sm text-gray-500 font-medium mb-6 relative z-10">Target: 8 Gelas Sehari</p>
         )}

         <div className="flex gap-2 flex-wrap justify-center relative z-10">
            {[...Array(8)].map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => handleWaterClick(i + 1)}
                  className={cn("p-3 rounded-2xl transition-all", i < waterGlasses ? (waterGlasses >= 8 ? "bg-white/20 text-white scale-110 shadow-inner" : "bg-sky-100 text-sky-500 scale-110 shadow-inner") : "bg-gray-50 text-gray-300 hover:bg-sky-50")}
                >
                    <Droplets size={24} className={i < waterGlasses ? (waterGlasses >= 8 ? "fill-white" : "fill-sky-400") : ""} />
                </button>
            ))}
         </div>
         <div className="mt-6 flex justify-center relative z-10">
             <button onClick={() => setWaterGlasses(0)} className={cn("text-xs font-bold uppercase tracking-widest transition-colors", waterGlasses >= 8 ? "text-sky-200 hover:text-white" : "text-gray-400 hover:text-sky-500")}>Reset</button>
         </div>
      </section>

      {/* Diet Makanan & Pencatatan */}
      <section className="w-full bg-white p-8 rounded-[3rem] shadow-sm border border-indigo-50">
          <h3 className="font-display text-2xl text-blue-900 mb-6">Diet Jaga Makanan</h3>
          <div className="space-y-4 mb-8">
              {Object.entries(dietRestrictions).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-3">
                      <input type="checkbox" checked={!!val} onChange={() => setDietRestrictions({...dietRestrictions, [key]: !dietRestrictions[key]})} className="w-5 h-5 accent-indigo-500 rounded-md cursor-pointer" />
                      <span className={cn("font-medium text-gray-700", val && "line-through text-gray-400")}>Menghindari {[ 'Makanan Berminyak / Gorengan', 'Makanan Manis / Gula Berlebih', 'Tepung-tepungan'][['minyak','manis','tepung'].indexOf(key)]}</span>
                  </div>
              ))}
          </div>

          <h4 className="font-display text-xl text-blue-900 mb-4">Catatan Makanan</h4>
          <div className="space-y-2 mb-8">
            <input value={foodNote} onChange={e => setFoodNote(e.target.value)} placeholder="Contoh: Nasi goreng dada ayam" className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            <input value={foodCal} onChange={e => setFoodCal(e.target.value)} placeholder="Contoh: 400" type="number" className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            <button onClick={addFood} className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-colors shadow-md shadow-indigo-100 mt-2">{editingItem?.type === 'food' ? 'Update Makanan' : 'Simpan Makanan'}</button>
          </div>

          {foodLogs.length > 0 && (
              <div className="mt-4">
                  <h4 className="font-bold text-lg mb-4 text-blue-800">Riwayat Makan</h4>
                  <div className="space-y-3">
                      {foodLogs.map((log: any) => (
                          <div key={log.id} className="p-4 bg-white border border-indigo-50 rounded-2xl flex justify-between items-center hover:shadow-md transition-shadow">
                              <div>
                                  <p className="font-bold text-gray-800">{log.note}</p>
                                  <p className="text-sm font-semibold text-indigo-500">{log.cal} kcal</p>
                                  <p className="text-xs text-gray-400 mt-1">{log.date}</p>
                              </div>
                              <div className="flex gap-2">
                                  <button onClick={() => editFood(log)} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-colors"><Edit2 size={16}/></button>
                                  <button onClick={() => setFoodLogs(foodLogs.filter((f: any) => f.id !== log.id))} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={16}/></button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}
      </section>

      <section className="w-full bg-white p-8 rounded-[3rem] shadow-sm border border-pink-50">
          <h3 className="font-display text-2xl text-blue-900 mb-6">Skincare Routine</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <p className="font-black tracking-widest text-pink-400 uppercase text-[10px] bg-pink-50 inline-block px-3 py-1 rounded-full">Pagi Hari</p>
                {Object.entries(skincare.pagi).map(([key, val]) => (
                    <div key={`pagi-${key}`} className="flex items-center gap-3">
                        <input type="checkbox" checked={!!val} onChange={() => setSkincare({...skincare, pagi: {...skincare.pagi, [key]: !skincare.pagi[key]}})} className="w-5 h-5 accent-pink-500 rounded-md cursor-pointer" />
                        <span className={cn("font-medium text-gray-700", val && "line-through text-gray-400")}>{[ 'Facial Wash', 'Toner', 'Moisturizer', 'Sunscreen'][['w','t','m','s'].indexOf(key)]}</span>
                    </div>
                ))}
            </div>
            <div className="space-y-4">
                <p className="font-black tracking-widest text-indigo-400 uppercase text-[10px] bg-indigo-50 inline-block px-3 py-1 rounded-full">Malam Hari</p>
                {Object.entries(skincare.malam).map(([key, val]) => (
                    <div key={`malam-${key}`} className="flex items-center gap-3">
                        <input type="checkbox" checked={!!val} onChange={() => setSkincare({...skincare, malam: {...skincare.malam, [key]: !skincare.malam[key]}})} className="w-5 h-5 accent-indigo-500 rounded-md cursor-pointer" />
                        <span className={cn("font-medium text-gray-700", val && "line-through text-gray-400")}>{[ 'Double Cleansing', 'Toner', 'Serum / Essence', 'Moisturizer / Night Cream'][['d','t','s','m'].indexOf(key)]}</span>
                    </div>
                ))}
            </div>
          </div>
      </section>
      
      {detectedFood && (
          <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 rounded-[3rem] w-full max-w-sm shadow-2xl text-center">
                  <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner overflow-hidden">
                      <img src={detectedFood.image} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-2xl font-display text-blue-900 mb-2">Hasil Deteksi</h3>
                  <div className="bg-gray-50 p-4 rounded-2xl mb-8">
                     <p className="font-bold text-gray-800 text-lg">{detectedFood.note}</p>
                     <p className="text-indigo-500 font-black text-xl mt-1">{detectedFood.cal} <span className="text-sm font-bold text-gray-400">kcal</span></p>
                  </div>
                  <div className="flex gap-3">
                      <button 
                         onClick={() => {
                             setDetectedFood(null);
                             setFoodImage(null);
                             if (foodCameraInputRef.current) foodCameraInputRef.current.value = '';
                         }} 
                         className="flex-1 py-4 rounded-2xl font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                      >
                          BATAL
                      </button>
                      <button 
                         onClick={() => {
                             if (detectedFood) {
                                  const newLog = {
                                     id: Date.now(), 
                                     note: detectedFood.note, 
                                     cal: Number(detectedFood.cal), 
                                     date: new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
                                     image: detectedFood.image
                                 };
                                 setFoodLogs([newLog, ...foodLogs]);
                                 
                                 setFoodNote(detectedFood.note);
                                 setFoodCal(String(detectedFood.cal));
                             }
                             setDetectedFood(null);
                             if (foodCameraInputRef.current) foodCameraInputRef.current.value = '';
                             toast.success('Makanan disimpan!');
                         }} 
                         className="flex-1 py-4 rounded-2xl font-bold bg-indigo-500 text-white shadow-xl shadow-indigo-200 hover:bg-indigo-600 transition-all font-bold tracking-wide"
                      >
                          SIMPAN
                      </button>
                  </div>
              </motion.div>
          </div>
      )}

    </ViewWrapper>
  );
};

const AIChatView: React.FC<{ session: any }> = ({ session }) => {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string, image_url?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from('ai_chats')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: true });
    if (!error && data) setMessages(data as any);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input && !image) return;
    
    const userMsg = { 
      user_id: session.user.id,
      role: 'user' as const, 
      content: input, 
      image_url: image || undefined,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMsg as any]);
    const currentInput = input;
    const currentImage = image;
    setInput('');
    setImage(null);
    setLoading(true);

    try {
      // Background save to Supabase
      supabase.from('ai_chats').insert([userMsg]).then();

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: currentInput, 
          image: currentImage,
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })) 
        })
      });
      const data = await res.json();
      
      const assistMsg = {
        user_id: session.user.id,
        role: 'assistant' as const,
        content: data.text,
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, assistMsg as any]);
      supabase.from('ai_chats').insert([assistMsg]).then();
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant' as const, content: 'Maaf, terjadi kesalahan koneksi. Pastikan internetmu stabil ya!' } as any]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
         alert("Ukuran gambar terlalu besar (maks 2MB)");
         return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <ViewWrapper className="flex flex-col h-full overflow-hidden p-0 relative">
      <div className="bg-white/80 backdrop-blur-md p-6 flex items-center justify-between border-b border-blue-50 shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-100">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="text-md font-bold text-blue-900">GlowUp AI Assistant</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Ready to help</p>
            </div>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-52">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-24 h-24 bg-blue-50 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner">
              <MessageCircle size={48} className="text-blue-400" />
            </div>
            <h4 className="text-xl font-display text-blue-900 mb-2">Halo! Aku GlowUp AI</h4>
            <p className="max-w-xs text-gray-400 font-medium text-sm">Tanya apa saja tentang kesehatan, motivasi, atau curhat ringan. Aku di sini untukmu! ✨</p>
            
            <div className="grid grid-cols-1 gap-2 mt-8 w-full max-w-xs">
               {["Bagaimana cara mulai habit baru?", "Beri aku motivasi pagi ini", "Tips menabung yang efektif"].map(t => (
                 <button key={t} onClick={() => setInput(t)} className="p-4 bg-white border border-blue-50 rounded-2xl text-xs font-bold text-blue-500 hover:bg-blue-50 transition-all text-left">
                   "{t}"
                 </button>
               ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={cn("flex items-start gap-3", m.role === 'user' ? "flex-row-reverse" : "")}>
            <div className={cn("w-10 h-10 rounded-2xl flex-shrink-0 shadow-sm flex items-center justify-center text-lg", m.role === 'user' ? "bg-blue-100" : "bg-pink-100")}>
              {m.role === 'user' ? '👤' : '✨'}
            </div>
            <div className={cn(
              "max-w-[85%] p-4 rounded-[2rem] shadow-sm",
              m.role === 'user' ? "bg-blue-600 text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none border border-pink-100"
            )}>
              {m.image_url && <img src={m.image_url} alt="User upload" className="rounded-2xl mb-3 max-w-full h-auto shadow-md" />}
              <p className="leading-relaxed font-medium text-sm whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start gap-3">
             <div className="w-10 h-10 rounded-2xl bg-pink-100 flex-shrink-0 shadow-sm flex items-center justify-center text-lg">✨</div>
             <div className="bg-white border border-pink-100 p-5 rounded-[2rem] rounded-tl-none flex gap-1.5">
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-primary-pink rounded-full" />
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-primary-pink rounded-full" />
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-primary-pink rounded-full" />
             </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-6 left-6 right-6 space-y-4">
        {image && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 bg-white/90 backdrop-blur p-2 pr-4 rounded-2xl w-fit shadow-2xl border border-blue-100 ring-4 ring-blue-50/50">
            <img src={image} className="h-14 w-14 object-cover rounded-xl" alt="Preview" />
            <button onClick={() => setImage(null)} className="bg-red-50 text-red-500 p-1.5 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Plus className="rotate-45" size={14} /></button>
          </motion.div>
        )}
        <div className="flex gap-3 items-center">
          <label className="bg-white border border-blue-100 p-5 rounded-[1.5rem] text-blue-400 cursor-pointer hover:bg-blue-50 transition-all shadow-xl shadow-gray-100 flex items-center justify-center group shrink-0">
            <Plus size={28} className="group-hover:rotate-90 transition-transform" />
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
          </label>
          <div className="flex-1 relative shadow-2xl shadow-gray-100">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
              placeholder={t('ai.placeholder')}
              className="w-full bg-white border border-pink-100 p-5 pr-16 rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-primary-pink transition-all font-medium text-sm md:text-base"
            />
            <button 
              onClick={handleSend}
              disabled={loading || (!input && !image)}
              className={cn(
                "absolute right-2 top-2 w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg",
                loading || (!input && !image) ? "bg-gray-100 text-gray-300" : "bg-primary-pink text-white hover:scale-105 active:scale-95 shadow-primary-pink/20"
              )}
            >
              <ArrowRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </ViewWrapper>
  );
};

const AuthView = ({ onComplete }: { onComplete: (session?: any) => void }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError('');
    setStatus('loading');

    // Robust fallback for testing/first turn
    if (!isConfigured) {
      setTimeout(() => {
        onComplete({ 
          user: { 
            id: 'demo-user-123', 
            email: email || 'demo@glowup.ai' 
          } 
        });
        setStatus('idle');
      }, 700);
      return;
    }
    
    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onComplete(data.session);
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) onComplete(data.session);
        else setError('Berhasil! Silakan periksa email atau masuk.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal login.');
    } finally {
      setStatus('idle');
    }
  };

  const handleGuestMode = () => {
    onComplete({ 
      user: { 
        id: 'guest-user-999', 
        email: 'tamu@glowup.ai' 
      } 
    });
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#fdf2f8] flex flex-col p-8 overflow-y-auto items-center justify-center">
      <div className="w-full max-w-sm flex flex-col h-full md:h-auto md:justify-center">
        <header className="mb-12 text-center">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-pink-100">
            <Sparkles size={40} className="text-primary-pink" />
          </div>
          <h1 className="text-4xl font-display text-blue-900 mb-2">GlowUp Life</h1>
          <p className="text-gray-400 font-medium">Mulailah perjalanan Glow-Up Anda</p>
        </header>

        <div className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-pink-100 border border-pink-50">
          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-pink outline-none font-medium transition-all" 
                placeholder="nama@email.com"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block">Secure Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-pink outline-none font-medium transition-all" 
                placeholder="••••••••"
              />
            </div>
            
            {error && <p className="text-red-500 text-xs text-center font-bold bg-red-50 p-3 rounded-xl">{error}</p>}

            <div className="flex flex-col gap-3">
              <button 
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-blue-900 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-blue-100 disabled:opacity-50 hover:scale-[1.02] active:scale-95 transition-all"
              >
                {status === 'loading' ? 'Memproses...' : (mode === 'login' ? 'Masuk' : 'Daftar Sekarang')}
              </button>

              <button 
                type="button"
                onClick={handleGuestMode}
                className="w-full bg-pink-50 text-primary-pink py-4 rounded-2xl font-bold text-sm hover:bg-pink-100 transition-all border border-pink-100"
              >
                Jelajahi Sebagai Tamu (Demo)
              </button>
            </div>
          </form>

          <div className="flex items-center my-8 gap-4 px-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[10px] text-gray-300 font-bold tracking-widest">OR</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full bg-white border border-gray-100 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all text-gray-700 shadow-sm"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            Sign in with Google
          </button>
        </div>

        <footer className="mt-12 text-center">
          <button 
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-blue-900/40 font-bold hover:text-primary-pink transition-colors"
          >
            {mode === 'login' ? (
              <p>Belum punya akun? <span className="text-primary-pink">Daftar Sekarang</span></p>
            ) : (
              <p>Sudah punya akun? <span className="text-primary-pink">Silakan Masuk</span></p>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
};


const TrackersView = () => {
    const [workoutLogs, setWorkoutLogs] = useState(() => JSON.parse(localStorage.getItem('workout_logs') || '[]'));
    const [workoutNote, setWorkoutNote] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingItem, setEditingItem] = useState<{ type: 'workout', id: number, activity?: string, image?: string } | null>(null);
    const [workoutImage, setWorkoutImage] = useState<string | null>(null);
    const workoutFileInputRef = useRef<HTMLInputElement>(null);

    const handleWorkoutImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    setWorkoutImage(dataUrl);
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        localStorage.setItem('workout_logs', JSON.stringify(workoutLogs));
    }, [workoutLogs]);

    const addWorkout = () => {
        if (!workoutNote.trim()) return;
        
        const now = new Date();
        const formatterDate = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now);
        const formatterTime = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(now).replace(':', '.');
        const formattedDateTime = `${formatterDate} | Pukul ${formatterTime} WIB`;

         if (editingItem && editingItem.type === 'workout') {
            setWorkoutLogs(workoutLogs.map((item: any) => item.id === editingItem.id ? { ...item, activity: workoutNote, image: workoutImage } : item));
            setEditingItem(null);
        } else {
            setWorkoutLogs([{ id: Date.now(), activity: workoutNote, image: workoutImage, date: formattedDateTime }, ...workoutLogs]);
        }
        setWorkoutNote('');
        setWorkoutImage(null);
    };

    const editItem = (item: any, type: 'workout') => {
        setEditingItem({ ...item, type });
        setWorkoutNote(item.activity);
        setWorkoutImage(item.image || null);
    };

    const filteredWorkout = workoutLogs.filter((item: any) => item.activity.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <ViewWrapper viewKey="trackers" className="flex flex-col items-center max-w-2xl mx-auto pb-40 space-y-12">
            <div className="w-full">
                <h1 className="text-4xl font-display text-blue-900 mb-6">Olahraga Harian</h1>
                <input 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    placeholder="🔍 Cari riwayat olahraga..." 
                    className="w-full p-4 bg-white shadow-sm border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100" 
                />
            </div>

            <section className="w-full bg-white p-8 rounded-[3rem] shadow-sm border border-orange-50">
                <h3 className="font-display text-2xl text-blue-900 mb-6">Log Olahraga</h3>
                <div className="space-y-4 mb-8">
                    <input value={workoutNote} onChange={e => setWorkoutNote(e.target.value)} placeholder="Misal: Jogging 15 menit" className="w-full p-3 bg-gray-100 rounded-xl" />
                    
                    <div className="flex flex-col gap-2">
                        <input 
                            type="file" 
                            ref={workoutFileInputRef} 
                            onChange={handleWorkoutImageUpload} 
                            accept="image/*" 
                            className="hidden" 
                        />
                        {workoutImage ? (
                            <div className="relative w-full h-48 rounded-xl overflow-hidden group border border-gray-100">
                                <img src={workoutImage} alt="Workout" className="w-full h-full object-cover" />
                                <button onClick={() => setWorkoutImage(null)} className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"><Trash2 size={16}/></button>
                            </div>
                        ) : (
                            <button onClick={() => workoutFileInputRef.current?.click()} className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-orange-200 rounded-xl text-orange-400 font-bold hover:bg-orange-50 transition-colors">
                                <Camera size={20} />
                                Tambah Foto Dokumentasi
                            </button>
                        )}
                    </div>
                    
                    <button onClick={addWorkout} className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold">{editingItem?.type === 'workout' ? 'Update Olahraga' : 'Simpan Olahraga'}</button>
                </div>

                {filteredWorkout.length > 0 && (
                    <div className="mt-4">
                        <h4 className="font-bold text-lg mb-4 text-blue-800">Riwayat Olahraga</h4>
                        <div className="space-y-4">
                            {filteredWorkout.map((log: any) => (
                                <div key={log.id} className="p-4 bg-gray-50 border border-orange-50 rounded-2xl hover:bg-orange-50/30 transition-colors flex flex-col sm:flex-row gap-4">
                                    {log.image && (
                                        <div className="w-full sm:w-28 sm:h-28 aspect-square shrink-0 rounded-xl overflow-hidden bg-gray-200 shadow-sm">
                                            <img src={log.image} alt="Workout documentation" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="flex-1 flex justify-between items-start w-full">
                                        <div className="flex-1 pr-4">
                                            <p className="font-bold text-gray-800 text-lg">{log.activity}</p>
                                            <p className="text-xs text-gray-500 mt-2 font-medium bg-white px-2 py-1 inline-block rounded-md border border-gray-100">{log.date}</p>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <button onClick={() => editItem(log, 'workout')} className="p-2 text-orange-500 hover:bg-orange-100 rounded-lg transition-colors"><Edit2 size={16}/></button>
                                            <button onClick={() => setWorkoutLogs(workoutLogs.filter((w: any) => w.id !== log.id))} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </ViewWrapper>
    );
};

const SavingQuestComponent = () => {
  const [savingsList, setSavingsList] = useState<{id: number, amount: number, date: string}[]>(() => JSON.parse(localStorage.getItem('quest_savings') || '[]'));
  const [saveAmount, setSaveAmount] = useState('');
  
  const [wishlistName, setWishlistName] = useState(() => localStorage.getItem('quest_wishlist_name') || '');
  const [wishlistTarget, setWishlistTarget] = useState(() => parseInt(localStorage.getItem('quest_wishlist_target') || '0', 10));
  const [isEditingWishlist, setIsEditingWishlist] = useState(!wishlistName);

  const [streak, setStreak] = useState(() => parseInt(localStorage.getItem('quest_streak') || '0', 10));
  const [lastSaveDate, setLastSaveDate] = useState(() => localStorage.getItem('quest_last_date') || '');

  useEffect(() => {
    localStorage.setItem('quest_savings', JSON.stringify(savingsList));
    localStorage.setItem('quest_wishlist_name', wishlistName);
    localStorage.setItem('quest_wishlist_target', wishlistTarget.toString());
    localStorage.setItem('quest_streak', streak.toString());
    localStorage.setItem('quest_last_date', lastSaveDate);
  }, [savingsList, wishlistName, wishlistTarget, streak, lastSaveDate]);

  const totalSaved = savingsList.reduce((acc, curr) => acc + curr.amount, 0);
  
  const saveMoney = () => {
      const amount = parseInt(saveAmount.replace(/\D/g, ''), 10);
      if (!amount || amount <= 0) return;

      const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
      
      let newStreak = streak;
      if (lastSaveDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (lastSaveDate === yesterday.toLocaleDateString('en-CA')) {
              newStreak += 1;
          } else {
              newStreak = 1; // reset streak if missed a day
          }
          setStreak(newStreak);
          setLastSaveDate(today);
      }

      setSavingsList([{ id: Date.now(), amount, date: new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }, ...savingsList]);
      setSaveAmount('');
  };

  // Level & XP System
  // Base XP = totalSaved / 1000. + bonuses from streak
  const totalXp = Math.floor(totalSaved / 1000) + (streak * 50);
  
  const getLevelInfo = (xp: number) => {
      const levels = [
          { min: 0, title: 'Hemat Pemula' },
          { min: 500, title: 'Kolektor Koin' },
          { min: 2000, title: 'Master Nabung' },
          { min: 5000, title: 'Sultan Bijak' },
          { min: 15000, title: 'Investor Masa Depan' }
      ];
      let currentLevel = 1;
      let title = levels[0].title;
      let nextXp = levels[1].min;

      for (let i = 0; i < levels.length; i++) {
          if (xp >= levels[i].min) {
              currentLevel = i + 1;
              title = levels[i].title;
              nextXp = levels[i+1] ? levels[i+1].min : levels[i].min * 2;
          }
      }
      return { level: currentLevel, title, nextXp };
  };

  const { level, title, nextXp } = getLevelInfo(totalXp);
  const xpProgress = Math.min((totalXp / nextXp) * 100, 100);

  const wishlistProgress = wishlistTarget > 0 ? Math.min((totalSaved / wishlistTarget) * 100, 100) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8 w-full pb-10">
        <header className="text-center mb-8">
            <h1 className="text-4xl font-display text-blue-900 mb-2 mt-4">GlowUp Saving Quest 🎮</h1>
            <p className="text-gray-500 font-medium">Jadikan menabung lebih seru seperti main game!</p>
        </header>

        {/* Level & Streak Banner */}
        <section className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-lg shadow-indigo-200">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md border-4 border-white/40 flex flex-col items-center justify-center shrink-0">
                        <span className="text-sm font-black text-indigo-100 uppercase tracking-widest leading-none">Level</span>
                        <span className="text-4xl font-black">{level}</span>
                    </div>
                    <div>
                        <h2 className="text-3xl font-black mb-1">{title}</h2>
                        <p className="text-indigo-100 font-medium">{totalXp.toLocaleString('id-ID')} XP / {nextXp.toLocaleString('id-ID')} XP</p>
                        <div className="w-48 md:w-64 h-3 bg-black/20 rounded-full mt-3 overflow-hidden border border-white/10">
                            <div className="h-full bg-emerald-400 rounded-full transition-all duration-1000" style={{ width: `${xpProgress}%` }}></div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-[2rem] px-8 py-4 text-center border border-white/20">
                    <div className="text-4xl mb-1 animate-bounce">🔥</div>
                    <p className="font-extrabold text-2xl">{streak} Hari</p>
                    <p className="text-xs uppercase tracking-widest text-indigo-100 font-bold">Daily Streak</p>
                </div>
            </div>
            
            {/* Decor */}
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-purple-400/30 rounded-full blur-3xl"></div>
        </section>

        {/* Wishlist Quest */}
        <section className="bg-white rounded-[3rem] p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-display text-blue-900 mb-6 flex items-center gap-2"><Star className="text-yellow-400" fill="currentColor"/> Wishlist Quest</h3>
            
            {isEditingWishlist ? (
                <div className="space-y-4">
                    <input 
                        value={wishlistName} 
                        onChange={e => setWishlistName(e.target.value)} 
                        placeholder="Target Impian (Misal: Sepatu Lari Baru)" 
                        className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-100" 
                    />
                    <input 
                        value={wishlistTarget || ''} 
                        onChange={e => setWishlistTarget(parseInt(e.target.value.replace(/\D/g, ''), 10) || 0)} 
                        placeholder="Harga Target (Rp)" 
                        className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-100" 
                    />
                    <button 
                        onClick={() => { if(wishlistName && wishlistTarget) setIsEditingWishlist(false); }} 
                        className="w-full py-4 bg-indigo-500 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-colors"
                    >
                        Mulai Quest!
                    </button>
                </div>
            ) : (
                <div className="relative group p-6 border-2 border-dashed border-gray-200 rounded-[2rem] bg-gray-50/50">
                    <button onClick={() => setIsEditingWishlist(true)} className="absolute top-4 right-4 p-2 bg-white rounded-xl shadow-sm text-gray-400 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all"><Edit2 size={16}/></button>
                    
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Misi Saat Ini</p>
                            <h4 className="text-2xl font-black text-gray-800">{wishlistName}</h4>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-gray-600">Rp {totalSaved.toLocaleString('id-ID')}</p>
                            <p className="text-sm text-gray-400">dari Rp {wishlistTarget.toLocaleString('id-ID')}</p>
                        </div>
                    </div>
                    
                    <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden p-1 shadow-inner relative">
                        <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-1000 relative overflow-hidden" style={{ width: `${wishlistProgress}%` }}>
                            {/* Shine effect logic */}
                            <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite]"></div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center font-black text-xs text-black/50 tracking-widest drop-shadow-sm">
                            {wishlistProgress >= 100 ? 'QUEST SELESAI! 🎉' : `${wishlistProgress.toFixed(1)}%`}
                        </div>
                    </div>
                </div>
            )}
        </section>

        {/* Input Tabungan */}
        <section className="bg-white rounded-[3rem] p-8 shadow-sm border border-emerald-50 text-center">
            <h3 className="text-xl font-display text-blue-900 mb-6">Setor Uang / XP</h3>
            <div className="max-w-sm mx-auto space-y-4">
                <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-400">Rp</span>
                    <input 
                        value={saveAmount ? parseInt(saveAmount.replace(/\D/g, ''), 10).toLocaleString('id-ID') : ''}
                        onChange={e => setSaveAmount(e.target.value)}
                        placeholder="0"
                        className="w-full p-4 pl-14 text-2xl font-black text-gray-800 bg-gray-50 rounded-[2rem] outline-none focus:ring-4 focus:ring-emerald-100 text-center"
                    />
                </div>
                <button 
                  onClick={saveMoney}
                  className="w-full py-4 bg-emerald-500 text-white font-black text-lg rounded-[2rem] shadow-lg shadow-emerald-200 hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-2"
                >
                    <Plus size={24} /> Setor Tabungan
                </button>
            </div>
        </section>

        {/* Riwayat */}
        {savingsList.length > 0 && (
            <section>
                <h4 className="font-bold text-lg mb-4 text-blue-800 px-4">Riwayat Quest Tabungan</h4>
                <div className="space-y-3">
                    {savingsList.map((item) => (
                        <div key={item.id} className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-gray-50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center font-black">
                                    +XP
                                </div>
                                <div>
                                    <p className="font-black text-gray-800">Menabung Rp {item.amount.toLocaleString('id-ID')}</p>
                                    <p className="text-xs text-gray-400 font-medium">{item.date}</p>
                                </div>
                            </div>
                            <button onClick={() => setSavingsList(savingsList.filter(s => s.id !== item.id))} className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-colors">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        )}
    </div>
  );
};

const GamesView: React.FC<{ session: any }> = ({ session }) => {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const { saveScore } = useGames(session?.user?.id);

  const gameList = [
    { id: 'memory', name: 'Memory Match', icon: BrainCircuit, color: 'from-pink-400 to-pink-500', component: MemoryMatch },
    { id: 'catcher', name: 'Mood Catcher', icon: Star, color: 'from-sky-400 to-sky-500', component: MoodCatcher },
    { id: 'breathing', name: 'Calm Breathing', icon: Wind, color: 'from-indigo-400 to-indigo-500', component: CalmBreathing },
    { id: 'reflex', name: 'Reflex Tap', icon: Zap, color: 'from-orange-400 to-orange-500', component: ReflexTap },
  ];

  if (activeGame === 'saving_quest') {
      return (
        <ViewWrapper viewKey="games" className="max-w-3xl mx-auto pb-40 space-y-6">
            <button onClick={() => setActiveGame(null)} className="flex items-center gap-2 text-blue-900 font-bold bg-white px-6 py-3 rounded-2xl shadow-sm w-fit">
                <ArrowRight className="rotate-180" size={18} /> Kembali ke Menu
            </button>
            <SavingQuestComponent />
        </ViewWrapper>
      );
  }

  if (activeGame) {
    const GameComponent = gameList.find(g => g.id === activeGame)?.component;
    return (
      <ViewWrapper viewKey="games" className="max-w-3xl mx-auto pb-40 space-y-6">
        <button onClick={() => setActiveGame(null)} className="flex items-center gap-2 text-blue-900 font-bold bg-white px-6 py-3 rounded-2xl shadow-sm w-fit">
           <ArrowRight className="rotate-180" size={18} /> Kembali ke Menu
        </button>
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-pink-50 min-h-[500px] flex flex-col items-center justify-center">
          {GameComponent && <GameComponent onWin={(score: number) => saveScore(activeGame, score)} onComplete={(score: number) => saveScore(activeGame, score)} />}
        </div>
      </ViewWrapper>
    );
  }

  return (
    <ViewWrapper viewKey="games" className="max-w-3xl mx-auto pb-40 space-y-8">
        <header className="text-center mb-8">
            <h1 className="text-4xl font-display text-blue-900 mb-2 mt-4">Menu Interaktif 🎮</h1>
            <p className="text-gray-500 font-medium">Pilih game seru atau lanjutkan misi menabungmu!</p>
        </header>

        {/* Saving Quest Banner Button */}
        <button 
            onClick={() => setActiveGame('saving_quest')}
            className="w-full relative overflow-hidden bg-gradient-to-r from-emerald-400 to-teal-500 p-8 rounded-[3rem] shadow-xl shadow-emerald-200 hover:scale-[1.02] active:scale-95 transition-all text-left flex items-center justify-between"
        >
            <div className="flex items-center gap-6 relative z-10">
                <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-inner text-emerald-500">
                    <Star size={40} fill="currentColor" className="animate-pulse" />
                </div>
                <div>
                   <p className="text-emerald-50 font-bold text-sm tracking-widest uppercase mb-1">Misi Harian</p>
                   <h3 className="text-3xl font-display text-white mb-1">GlowUp Saving Quest</h3>
                   <p className="text-emerald-100 font-medium">Tingkatkan level hematmu & capai target!</p>
                </div>
            </div>
            <div className="bg-white text-emerald-500 w-12 h-12 rounded-full flex items-center justify-center shadow-lg relative z-10 shrink-0 hidden sm:flex">
                <ChevronRight size={24} />
            </div>
            
            {/* Decor */}
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
        </button>

        <h3 className="text-2xl font-display text-blue-900 mb-4 px-4">Mini Games Relaksasi</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {gameList.map((game) => (
                <button 
                key={game.id}
                onClick={() => setActiveGame(game.id)}
                className="group relative overflow-hidden bg-white p-8 rounded-[3rem] shadow-xl shadow-gray-100 hover:scale-[1.02] active:scale-95 transition-all text-left border border-gray-50 h-56 flex flex-col justify-between"
                >
                <div className={cn("w-16 h-16 rounded-[1.5rem] bg-gradient-to-tr flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform", game.color)}>
                    <game.icon size={32} />
                </div>
                <div>
                    <h3 className="text-2xl font-display text-blue-900 mb-2">{game.name}</h3>
                    <div className="flex items-center gap-2 text-primary-pink font-bold text-xs uppercase tracking-widest">
                        Mainkan Sekarang <ChevronRight size={14} />
                    </div>
                </div>
                </button>
            ))}
        </div>
    </ViewWrapper>
  );
};

const SafetyView: React.FC<{ session: any, contacts: any[], addContact: any, deleteContact: any }> = ({ session, contacts, addContact, deleteContact }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relation: '' });
  const [isTracking, setIsTracking] = useState(false);
  const [currentPos, setCurrentPos] = useState<{ lat: number, lng: number } | null>(null);
  const watchId = React.useRef<number | null>(null);

  const getMapsLink = (lat: number, lng: number) => `https://www.google.com/maps?q=${lat},${lng}`;

  const stopSOS = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setIsTracking(false);
  };

  const triggerSOS = () => {
    if (contacts.length === 0) {
      toast.error("Tambahkan kontak darurat terlebih dahulu!");
      setShowAdd(true);
      return;
    }

    if (isTracking) {
      stopSOS();
      toast('Live Tracking Dimatikan', { icon: '📴' });
      return;
    }

    setIsTracking(true);
    toast.loading('Mencari posisi kamu...', { id: 'sos-loc' });
    
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentPos({ lat: latitude, lng: longitude });
        toast.success('Lokasi ditemukan! Siap dibagikan.', { id: 'sos-loc' });
        
        // Only auto-open on start
        if (!currentPos) {
          const link = getMapsLink(latitude, longitude);
          const message = `🚨 SOS ALERT (GlowUp Life)\n\nSaya dalam bahaya! Ini lokasi live saya:\n${link}\n\nMohon segera hubungi saya.`;
          const firstContact = contacts[0];
          const waUrl = `https://wa.me/${firstContact.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
          window.open(waUrl, '_blank');
        }
      },
      (err) => {
        console.error(err);
        toast.error("GPS Error: " + err.message, { id: 'sos-loc' });
        setIsTracking(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const updateLocationManually = () => {
    if (!currentPos) {
      toast.error("Tunggu hingga lokasi terdeteksi...");
      return;
    }
    const link = getMapsLink(currentPos.lat, currentPos.lng);
    const message = `📍 UPDATE LOKASI LIVE (GlowUp Life)\n\nLokasi terbaru saya:\n${link}`;
    const firstContact = contacts[0];
    const waUrl = `https://wa.me/${firstContact.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    toast.success('Link lokasi dikirim ke WhatsApp!');
  };

  useEffect(() => {
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, []);

  return (
    <ViewWrapper viewKey="safety" className="flex flex-col items-center max-w-2xl mx-auto pb-40">
      <div className="w-full text-center mb-10">
        <h1 className="text-4xl font-display text-blue-900 mb-2">SOS Darurat</h1>
        <p className="text-gray-400 font-medium">Bantuan cepat saat kamu dalam bahaya.</p>
      </div>

      <div className={cn(
        "bg-white p-12 rounded-[4rem] border transition-all duration-500 flex flex-col items-center gap-8 mb-12 w-full",
        isTracking ? "border-red-500 shadow-2xl shadow-red-200 bg-red-50/10" : "border-red-50 shadow-2xl shadow-red-50"
      )}>
         <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={triggerSOS}
          className={cn(
            "w-56 h-56 rounded-full flex flex-col items-center justify-center text-white shadow-2xl relative group transition-all duration-500",
            isTracking ? "bg-red-700 animate-pulse" : "bg-gradient-to-tr from-red-500 to-red-600"
          )}
         >
            <div className={cn("absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20", isTracking ? "hidden" : "")} />
            <ShieldAlert size={90} className="relative z-10" />
            <span className="font-black text-3xl mt-2 tracking-[0.2em] relative z-10">{isTracking ? 'STOP' : 'SOS'}</span>
         </motion.button>
         
         {isTracking && currentPos && (
           <div className="flex flex-col items-center gap-4 w-full">
             <div className="flex items-center gap-2 bg-red-100 px-6 py-3 rounded-full border border-red-200">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                <span className="text-red-700 font-bold text-sm">LIVE TRACKING AKTIF</span>
             </div>
             <button 
              onClick={updateLocationManually}
              className="flex items-center gap-2 bg-white border-2 border-red-500 text-red-500 px-8 py-3 rounded-[2rem] font-bold hover:bg-red-500 hover:text-white transition-all shadow-xl"
             >
               <Plus className="rotate-45" size={20} /> Update Lokasi di WA
             </button>
             <p className="text-[10px] text-gray-400 font-bold uppercase">Lat: {currentPos.lat.toFixed(6)}, Lng: {currentPos.lng.toFixed(6)}</p>
           </div>
         )}

         {!isTracking && (
           <div className="flex items-center gap-2 bg-red-50 px-6 py-2 rounded-full border border-red-100">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-500 font-bold text-xs uppercase tracking-widest">Satelit Terkoneksi</span>
           </div>
         )}
      </div>

      <div className="w-full space-y-6">
         <div className="flex justify-between items-center px-4">
            <h3 className="font-display text-2xl text-blue-900">Kontak Terpercaya</h3>
            <button onClick={() => setShowAdd(!showAdd)} className="w-10 h-10 rounded-2xl bg-primary-pink text-white flex items-center justify-center shadow-lg shadow-pink-100 transition-transform active:rotate-90">
              <Plus size={24} />
            </button>
         </div>

         {showAdd && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[3rem] shadow-xl border-2 border-dashed border-pink-100 space-y-6">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input className="p-4 bg-pink-50/50 rounded-2xl outline-none font-bold" placeholder="Nama Kontak" value={newContact.name} onChange={e => setNewContact({...newContact, name:e.target.value})} />
                  <input className="p-4 bg-pink-50/50 rounded-2xl outline-none font-bold" placeholder="Nomor HP" value={newContact.phone} onChange={e => setNewContact({...newContact, phone:e.target.value})} />
               </div>
               <input className="w-full p-4 bg-pink-50/50 rounded-2xl outline-none font-bold" placeholder="Hubungan (cth: Ibu, Sahabat)" value={newContact.relation} onChange={e => setNewContact({...newContact, relation:e.target.value})} />
               <div className="flex gap-4">
                 <button onClick={() => setShowAdd(false)} className="flex-1 py-4 bg-gray-100 text-gray-400 font-bold rounded-2xl">Batal</button>
                 <button 
                  onClick={async () => {
                    if (newContact.name && newContact.phone) {
                      await addContact(newContact.name, newContact.phone, newContact.relation);
                      setShowAdd(false);
                      setNewContact({ name: '', phone: '', relation: '' });
                    }
                  }}
                  className="flex-2 py-4 bg-primary-pink text-white font-bold rounded-2xl shadow-xl shadow-pink-100"
                 >
                   Simpan Kontak
                 </button>
               </div>
            </motion.div>
         )}

         <div className="grid grid-cols-1 gap-4">
            {contacts.map(contact => (
              <div key={contact.id} className="bg-white p-6 rounded-[2.5rem] flex justify-between items-center shadow-md border border-gray-50 group">
                <div className="flex items-center gap-5">
                   <div className="w-16 h-16 rounded-[1.5rem] bg-pink-50 flex items-center justify-center text-primary-pink font-bold text-2xl shadow-inner">
                      {contact.name[0]}
                   </div>
                   <div>
                      <p className="font-bold text-blue-900 text-lg">{contact.name}</p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{contact.relation || 'Kontak'}</p>
                      <p className="text-primary-pink font-display font-medium mt-1">{contact.phone}</p>
                   </div>
                </div>
                <div className="flex gap-2">
                   <a href={`tel:${contact.phone}`} className="p-4 rounded-2xl bg-sky-blue/10 text-sky-blue hover:bg-sky-blue hover:text-white transition-all"><Phone size={22} /></a>
                   <button onClick={() => deleteContact(contact.id)} className="p-4 rounded-2xl bg-red-50 text-red-300 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={22} /></button>
                </div>
              </div>
            ))}
            {contacts.length === 0 && !showAdd && (
               <div className="p-20 text-center border-2 border-dashed border-gray-100 rounded-[4rem] opacity-30">
                  < ShieldAlert size={48} className="mx-auto mb-4" />
                  <p className="font-bold uppercase tracking-widest text-sm">Belum ada kontak darurat.</p>
               </div>
            )}
         </div>
      </div>
    </ViewWrapper>
  );
};

const ProfileView: React.FC<{ session: any, onLogout: () => void }> = ({ session, onLogout }) => {
  const [userName, setUserName] = useState(() => localStorage.getItem('user_name') || session.user.email?.split('@')[0] || 'Tamu');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('user_email') || session.user.email);
  const [profileImage, setProfileImage] = useState(() => localStorage.getItem('profile_image') || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`);
  const [isEditingName, setIsEditingName] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('user_name', userName);
    localStorage.setItem('user_email', userEmail);
    localStorage.setItem('profile_image', profileImage);
    window.dispatchEvent(new Event('profile-updated'));
  }, [userName, userEmail, profileImage]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setProfileImage(dataUrl);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // Func stat calculation
  const totalFood = JSON.parse(localStorage.getItem('food_logs') || '[]').length;
  const totalWorkout = JSON.parse(localStorage.getItem('workout_logs') || '[]').length;
  const skincare = JSON.parse(localStorage.getItem('skincare') || '{"pagi": {}, "malam": {}}');
  const skincarePagiChecked = Object.values(skincare.pagi || {}).filter(Boolean).length;
  const skincareMalamChecked = Object.values(skincare.malam || {}).filter(Boolean).length;
  const totalHabits = totalFood + totalWorkout + skincarePagiChecked + skincareMalamChecked;

  const totalMoods = JSON.parse(localStorage.getItem('mood_logs') || '[]').length;
  const tabunganData = JSON.parse(localStorage.getItem('tabungan_data') || '{"transactions": []}');
  const totalSavingTx = tabunganData.transactions.length;

  return (
    <ViewWrapper viewKey="profile" className="flex flex-col items-center py-10 max-w-md mx-auto pb-40">
      <div className="relative mb-8 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
        <div className="w-40 h-40 rounded-full border-[8px] border-white shadow-2xl overflow-hidden group-hover:scale-105 transition-transform relative">
          <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white font-bold text-xs uppercase tracking-widest">Ubah Foto</span>
          </div>
        </div>
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
        />
        <button className="absolute bottom-2 right-2 p-4 bg-sky-blue text-white rounded-[1.5rem] shadow-xl ring-8 ring-white hover:rotate-90 transition-transform"><Settings size={22} /></button>
      </div>
      
      {isEditingName ? (
        <div className="flex flex-col gap-3 mb-8 w-full max-w-[250px] mx-auto">
          <input 
            autoFocus
            value={userName} 
            onChange={e => setUserName(e.target.value)}
            className="w-full p-2 text-center text-xl font-display text-blue-900 border-b-2 border-primary-pink outline-none bg-transparent" 
            placeholder="Nama Pengguna"
          />
          <input 
            value={userEmail} 
            onChange={e => setUserEmail(e.target.value)}
            className="w-full p-2 text-center text-sm font-medium text-gray-500 border-b-2 border-primary-pink outline-none bg-transparent" 
            placeholder="Email"
          />
          <button onClick={() => setIsEditingName(false)} className="text-white bg-primary-pink px-4 py-3 mt-2 rounded-xl text-sm font-bold shadow-md hover:bg-pink-600 transition-colors">Simpan Perubahan</button>
        </div>
      ) : (
        <div className="text-center mb-8 flex flex-col items-center">
            <h2 className="text-4xl font-display text-blue-900 mb-1">
              {userName} ✨
            </h2>
            <p className="text-gray-400 font-medium mb-4">{userEmail}</p>
            <button onClick={() => setIsEditingName(true)} className="px-5 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors uppercase tracking-widest">Edit Profil</button>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 w-full mb-10">
         <div className="bg-white p-4 rounded-3xl text-center border border-gray-50 shadow-sm">
            <p className="text-2xl font-black text-primary-pink">{totalHabits}</p>
            <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Habits</p>
         </div>
         <div className="bg-white p-4 rounded-3xl text-center border border-gray-50 shadow-sm">
            <p className="text-2xl font-black text-sky-blue">{totalMoods}</p>
            <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Moods</p>
         </div>
         <div className="bg-white p-4 rounded-3xl text-center border border-gray-50 shadow-sm">
            <p className="text-2xl font-black text-indigo-500">{totalSavingTx}</p>
            <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Goals</p>
         </div>
      </div>

      <div className="w-full space-y-4">
         <div className="bg-white rounded-[3rem] p-3 shadow-xl border border-gray-50">
            {[
              { icon: Heart, label: 'Kesehatan & Wellness', color: 'text-primary-pink', bg: 'bg-pink-50' },
              { icon: Wallet, label: 'Target & Keuangan', color: 'text-indigo-500', bg: 'bg-indigo-50' },
              { icon: ShieldAlert, label: 'Keamanan Akun', color: 'text-red-500', bg: 'bg-red-50' },
              { icon: Settings, label: 'Pengaturan', color: 'text-gray-400', bg: 'bg-gray-100' },
            ].map((item, i) => (
              <button key={i} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 rounded-[2rem] transition-all group">
                 <div className="flex items-center gap-4">
                    <div className={cn("p-4 rounded-[1.2rem] group-hover:scale-110 transition-transform shadow-sm", item.bg, item.color)}>
                       <item.icon size={24} />
                    </div>
                    <span className="font-bold text-gray-700">{item.label}</span>
                 </div>
                 <ChevronRight size={20} className="text-gray-300 group-hover:text-primary-pink transition-colors" />
              </button>
            ))}
         </div>

         <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-4 p-7 bg-red-50 text-red-500 rounded-[3rem] font-bold text-xl hover:bg-red-500 hover:text-white transition-all shadow-sm group"
         >
            <LogOut size={26} className="group-hover:rotate-12 transition-transform" /> Keluar Akun
         </button>
      </div>
    </ViewWrapper>
  );
};

// --- Main App Logic ---

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [onboarded, setOnboarded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  // Lifted Hooks
  const { habits, toggleHabit, addHabit, deleteHabit } = useHabits(session?.user?.id);
  const { logs, addMood } = useMood(session?.user?.id);
  const { savings, addSaving, updateAmount, deleteSaving } = useSavings(session?.user?.id);
  const { reminders, addReminder, toggleReminder, updateProgress, deleteReminder } = useReminders(session?.user?.id);
  const { contacts, addContact, deleteContact } = useSafety(session?.user?.id);

  useEffect(() => {
    if (session?.user?.id && reminders.length > 0) {
      const interval = setInterval(() => {
        // Simple reminder check - in a real app this would use time fields
        // For demo, we just show a toast occasionally if reminders exist
        const activeCount = reminders.filter(r => r.is_active).length;
        if (activeCount > 0 && Math.random() > 0.95) { // Notify occasionally for demo
          toast('⏰ Jangan lupa jadwal hari ini!', { icon: '🔔' });
        }
      }, 30000); // Check every 30s
      return () => clearInterval(interval);
    }
  }, [session, reminders]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    
    const hasOnboarded = localStorage.getItem('onboarded');
    if (hasOnboarded) setOnboarded(true);
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarded', 'true');
    setOnboarded(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#fdf2f8]">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="relative"
        >
          <div className="w-24 h-24 border-4 border-soft-pink/30 border-t-primary-pink rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
             <Sparkles className="text-primary-pink" size={32} />
          </div>
        </motion.div>
      </div>
    );
  }

  if (!onboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (!session) {
    return <AuthView onComplete={(mockSession) => {
      if (mockSession) setSession(mockSession);
    }} />;
  }

  return (
    <div className="h-screen bg-main-gradient flex flex-col overflow-hidden">
      <Toaster position="top-center" />
      <TopNav session={session} onLogout={handleLogout} />
      
      <div className="flex-1 flex overflow-hidden">
        <DesktopSidebar active={activeTab} onChange={setActiveTab} />
        
        <main className="flex-1 overflow-hidden flex flex-col relative text-gray-800">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <HomeView 
                key="home" 
                session={session} 
                onTabChange={setActiveTab} 
                logs={logs}
                addMood={addMood}
                savings={savings}
                updateAmount={updateAmount}
              />
            )}
            {activeTab === 'ai' && <AIChatView key="ai" session={session} />}
            {activeTab === 'trackers' && <TrackersView />}
            {activeTab === 'games' && (
               <ViewWrapper viewKey="games" className="space-y-8 pb-40">
                  <header>
                    <h1 className="text-3xl font-display text-blue-900 mb-2">GlowUp Arena</h1>
                    <p className="text-gray-400 font-medium">Mainkan game seru sambil menjaga kesehatan mental.</p>
                  </header>
                  <GamesView session={session} />
               </ViewWrapper>
            )}
            {activeTab === 'profile' && <ProfileView key="profile" session={session} onLogout={handleLogout} />}
          </AnimatePresence>
          
          <Navbar active={activeTab} onChange={setActiveTab} />
        </main>
      </div>

      <footer className="h-10 px-8 hidden md:flex items-center justify-between bg-white text-[10px] text-gray-400 shrink-0 border-t border-gray-50 uppercase tracking-widest font-bold">
        <div className="flex gap-4">
          <span>Session: Active</span>
          <span>Cloud Sync: Done</span>
        </div>
        <div className="flex gap-4">
          <span className="text-primary-pink">Grow</span>
          <span className="text-sky-blue">Heal</span>
          <span className="text-primary-pink">Glow</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Safe & Secure Connection</span>
        </div>
      </footer>
    </div>
  );
}
