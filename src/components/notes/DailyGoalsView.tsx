import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, subDays, addDays, startOfDay, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award,
  Calendar,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../../store';
import { useAudio } from '../../hooks/useAudio';
import { cn } from '../../lib/utils';
import { DailyGoalItem, DailyGoalNote, Note } from '../../types';

const DEFAULT_GOALS = [
  { text: "Shalat Fardhu Tepat Waktu", category: "Ibadah" },
  { text: "Olahraga / Workout (15-30 Menit)", category: "Kesehatan" },
  { text: "Membaca Buku (10 Halaman / 15 Menit)", category: "Belajar" },
  { text: "Minum Air Putih (2-3 Liter)", category: "Kesehatan" },
  { text: "Merapikan Kamar & Meja Kerja", category: "Kebiasaan" },
];

export function DailyGoalsView() {
  const { notes, addNote, updateNote, deleteNote } = useAppContext();
  const { playClick, playSuccess, playError } = useAudio();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newGoalText, setNewGoalText] = useState("");
  const [newGoalCategory, setNewGoalCategory] = useState("Kesehatan");

  // Date formatted to YYYY-MM-DD
  const dateStr = useMemo(() => format(selectedDate, 'yyyy-MM-dd'), [selectedDate]);

  // Find daily goal note for the selected date
  const dailyGoalNote: DailyGoalNote | undefined = useMemo(() => {
    return notes.find(
      (n): n is DailyGoalNote => n.type === 'daily-goal' && n.dateStr === dateStr
    );
  }, [notes, dateStr]);

  const currentGoals = useMemo(() => {
    return dailyGoalNote?.goals || [];
  }, [dailyGoalNote]);

  const completionStats = useMemo(() => {
    const total = currentGoals.length;
    const completed = currentGoals.filter(g => g.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 105 - 5) : 0; // mapped to beautiful display
    const actualPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage: Math.max(0, actualPercentage) };
  }, [currentGoals]);

  // Handle initializing current date goals with defaults
  const handleLoadDefaults = () => {
    playClick();
    const initializedGoals: DailyGoalItem[] = DEFAULT_GOALS.map(dg => ({
      id: uuidv4(),
      text: dg.text,
      category: dg.category,
      completed: false
    }));

    if (dailyGoalNote) {
      updateNote({
        ...dailyGoalNote,
        goals: initializedGoals,
        updatedAt: Date.now()
      });
    } else {
      const newNote: DailyGoalNote = {
        id: uuidv4(),
        type: 'daily-goal',
        dateStr,
        goals: initializedGoals,
        createdAt: selectedDate.getTime(),
        updatedAt: Date.now()
      };
      addNote(newNote);
    }
    playSuccess();
  };

  // Add custom goal item
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;

    playClick();
    const newItem: DailyGoalItem = {
      id: uuidv4(),
      text: newGoalText.trim(),
      category: newGoalCategory,
      completed: false
    };

    const updatedGoals = [...currentGoals, newItem];

    if (dailyGoalNote) {
      updateNote({
        ...dailyGoalNote,
        goals: updatedGoals,
        updatedAt: Date.now()
      });
    } else {
      const newNote: DailyGoalNote = {
        id: uuidv4(),
        type: 'daily-goal',
        dateStr,
        goals: updatedGoals,
        createdAt: selectedDate.getTime(),
        updatedAt: Date.now()
      };
      addNote(newNote);
    }

    setNewGoalText("");
    playSuccess();
  };

  // Toggle goal item status
  const handleToggleGoal = (goalId: string) => {
    if (!dailyGoalNote) return;

    playClick();
    const updatedGoals = dailyGoalNote.goals.map(g => {
      if (g.id === goalId) {
        const nextStatus = !g.completed;
        return { ...g, completed: nextStatus };
      }
      return g;
    });

    const wasAllFinishedBefore = dailyGoalNote.goals.length > 0 && dailyGoalNote.goals.every(g => g.completed);
    const isAllFinishedNow = updatedGoals.length > 0 && updatedGoals.every(g => g.completed);

    updateNote({
      ...dailyGoalNote,
      goals: updatedGoals,
      updatedAt: Date.now()
    });

    if (isAllFinishedNow && !wasAllFinishedBefore) {
      setTimeout(() => {
        playSuccess();
      }, 150);
    }
  };

  // Delete goal item
  const handleDeleteGoal = (goalId: string) => {
    if (!dailyGoalNote) return;

    playError();
    const updatedGoals = dailyGoalNote.goals.filter(g => g.id !== goalId);

    if (updatedGoals.length === 0) {
      deleteNote(dailyGoalNote.id);
    } else {
      updateNote({
        ...dailyGoalNote,
        goals: updatedGoals,
        updatedAt: Date.now()
      });
    }
  };

  // Quick navigation between days
  const handlePrevDay = () => {
    playClick();
    setSelectedDate(prev => subDays(prev, 1));
  };

  const handleNextDay = () => {
    playClick();
    setSelectedDate(prev => addDays(prev, 1));
  };

  const handleGoToToday = () => {
    playClick();
    setSelectedDate(new Date());
  };

  // List of active categories
  const categories = ["Kesehatan", "Ibadah", "Belajar", "Kebiasaan", "Pekerjaan", "Lainnya"];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">
      
      {/* Header with back button */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div className="flex items-center gap-4">
          <button 
            type="button" 
            onClick={() => { playClick(); navigate('/notes'); }} 
            className="p-3 bg-paper rounded-2xl border border-stone-200 hover:bg-stone-50 transition-colors shadow-sm"
          >
            <ChevronLeft className="w-5 h-5 text-stone-600" />
          </button>
          <div>
            <h1 className="font-serif text-3xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
              Daily Goals <Award className="w-6 h-6 text-yellow-500 animate-bounce" />
            </h1>
            <p className="text-stone-500 text-xs mt-1 font-medium">
              Kelola pencapaian harian Anda secara terintegrasi.
            </p>
          </div>
        </div>

        {/* Today shortcut button */}
        {!isSameDay(selectedDate, new Date()) && (
          <button
            onClick={handleGoToToday}
            className="px-4 py-2 bg-stone-100 text-stone-700 hover:bg-stone-900 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm border border-stone-200"
          >
            Hari Ini
          </button>
        )}
      </header>

      {/* Date Switcher Ribbon */}
      <div className="flex items-center justify-between p-3 bg-paper border border-stone-300 rounded-3xl shadow-sm bg-white">
        <button
          onClick={handlePrevDay}
          className="p-2.5 rounded-xl border border-stone-200 hover:border-stone-900 transition-colors bg-stone-50"
        >
          <ChevronLeft className="w-4 h-4 text-stone-700" />
        </button>
        
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 text-stone-900 font-serif text-base font-bold">
            <Calendar className="w-4 h-4 text-accent-crimson" />
            <span>{format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: id })}</span>
          </div>
          <span className="text-[8px] uppercase tracking-widest font-black text-stone-400 mt-0.5">
            {isSameDay(selectedDate, new Date()) ? 'TARGET ANDA HARI INI' : 'RIWAYAT TARGET HARIAN'}
          </span>
        </div>

        <button
          onClick={handleNextDay}
          className="p-2.5 rounded-xl border border-stone-200 hover:border-stone-900 transition-colors bg-stone-50"
        >
          <ChevronRight className="w-5 h-5 text-stone-700" />
        </button>
      </div>

      {/* Progress & Stat Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Progress Circle card */}
        <div className="bg-paper p-6 rounded-3xl border-2 border-stone-900 shadow-brutal flex flex-col items-center justify-center space-y-4 text-center">
          <h2 className="text-xs uppercase tracking-widest text-stone-500 font-black">Progress Hari Ini</h2>
          
          <div className="relative w-32 h-32 flex items-center justify-center mx-auto">
            {/* SVG circle */}
            <svg className="w-full h-full transform -rotate-90 overflow-visible">
              <circle
                cx="64"
                cy="64"
                r="52"
                stroke="#e7e5e4"
                strokeWidth="12"
                fill="transparent"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="52"
                stroke={completionStats.percentage === 100 ? "#22c55e" : "#3b82f6"}
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 52}
                initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 52 * (1 - completionStats.percentage / 100)
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center leading-none">
              <span className="text-3xl font-black text-stone-900">{completionStats.percentage}%</span>
              <span className="text-[8px] font-black uppercase text-stone-400 tracking-wider mt-1">Selesai</span>
            </div>
          </div>

          <div className="text-xs font-black text-stone-700">
            {completionStats.completed} dari {completionStats.total} Target Tercapai
          </div>
        </div>

        {/* Add Goals form card */}
        <div className="md:col-span-2 bg-paper p-6 rounded-3xl border-2 border-stone-900 shadow-brutal space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <h2 className="text-sm uppercase tracking-widest text-stone-800 font-extrabold">Tambah Target Baru</h2>
          </div>

          <form onSubmit={handleAddGoal} className="space-y-4">
            <div>
              <label className="block text-[8px] font-black uppercase tracking-wider text-stone-400 mb-1">Target Achievement</label>
              <input
                type="text"
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                placeholder="Contoh: Belajar kosa kata bahasa inggris baru..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:border-stone-900 focus:bg-white outline-none font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[8px] font-black uppercase tracking-wider text-stone-400 mb-1">Kategori</label>
                <select
                  value={newGoalCategory}
                  onChange={(e) => setNewGoalCategory(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-stone-900 outline-none"
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white font-black uppercase tracking-widest text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" /> Tambah
                </button>
              </div>
            </div>
          </form>
        </div>

      </div>

      {/* Goals interactive list */}
      <div className="bg-paper p-6 md:p-8 rounded-[2.5rem] border-2 border-stone-900 shadow-brutal space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-stone-900">Daftar Target Harian</h2>
            {currentGoals.length > 0 && (
              <p className="text-xs text-stone-400 font-bold uppercase tracking-wider mt-1">{format(selectedDate, 'dd MMMM yyyy', { locale: id })}</p>
            )}
          </div>

          {currentGoals.length === 0 && (
            <button
              onClick={handleLoadDefaults}
              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-stone-900 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-stone-900 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Gunakan Templat Default
            </button>
          )}
        </div>

        {currentGoals.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-stone-200 rounded-3xl flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-stone-300">
              <CheckSquare className="w-8 h-8" />
            </div>
            <div>
              <p className="font-bold text-stone-800">Tidak Ada Target Terdaftar</p>
              <p className="text-xs text-stone-400 mt-1 uppercase tracking-wider font-extrabold max-w-sm mx-auto leading-normal">
                Gunakan tombol 'Gunakan Templat Default' untuk menginisiasi item target dasar atau tambahkan secara manual di atas.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {currentGoals.map((g) => {
                const isSelected = g.completed;
                return (
                  <motion.div
                    key={g.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cn(
                      "flex items-center justify-between p-4 border rounded-2xl transition-all shadow-sm select-none",
                      isSelected 
                        ? "bg-emerald-50/40 border-emerald-300 ring-2 ring-emerald-50" 
                        : "bg-white border-stone-200 hover:border-stone-400"
                    )}
                  >
                    <div 
                      onClick={() => handleToggleGoal(g.id)}
                      className="flex items-center gap-4 flex-1 cursor-pointer"
                    >
                      <button type="button" className={cn("transition-transform hover:scale-115 active:scale-95", isSelected ? "text-emerald-600" : "text-stone-400")}>
                        {isSelected ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6" />}
                      </button>
                      
                      <div className="flex flex-col items-start leading-tight">
                        <span className={cn("font-bold text-sm", isSelected ? "line-through text-stone-400" : "text-stone-900")}>
                          {g.text}
                        </span>
                        <span className={cn(
                          "text-[8px] font-black uppercase tracking-wider mt-1 px-2 py-0.5 rounded-md",
                          g.category === 'Ibadah' ? "bg-indigo-100 text-indigo-700" :
                          g.category === 'Kesehatan' ? "bg-emerald-100 text-emerald-700" :
                          g.category === 'Belajar' ? "bg-blue-100 text-blue-700" :
                          g.category === 'Kebiasaan' ? "bg-purple-100 text-purple-700" :
                          g.category === 'Pekerjaan' ? "bg-orange-100 text-orange-700" :
                          "bg-stone-100 text-stone-600"
                        )}>
                          {g.category}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteGoal(g.id)}
                      className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

    </div>
  );
}
