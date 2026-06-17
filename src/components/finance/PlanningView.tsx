import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, TrendingUp, TrendingDown, PiggyBank, Plus, Trash2, Edit3, ChevronRight, Sparkles, X, Gift, Check, DollarSign } from "lucide-react";
import { cn } from "../../lib/utils";
import { GoalProgress } from '../GoalProgress';
import { formatCurrency } from "../../lib/financeUtils";
import { Budget, SavingGoal } from "../../types";
import { v4 as uuidv4 } from 'uuid';

interface PlanningViewProps {
  budgets: Budget[];
  savings: SavingGoal[];
  financeRecords: any[];
  addBudget: (b: any) => void;
  deleteBudget: (id: string) => void;
  addSaving: (s: any) => void;
  updateSaving: (s: SavingGoal) => void;
  deleteSaving: (id: string) => void;
  showConfirm: (msg: string, onConfirm: () => void) => void;
  playClick: () => void;
  playSuccess: () => void;
  playError: () => void;
}

export function PlanningView({
  budgets,
  savings,
  financeRecords,
  addBudget,
  deleteBudget,
  addSaving,
  updateSaving,
  deleteSaving,
  showConfirm,
  playClick,
  playSuccess,
  playError
}: PlanningViewProps) {
  // Modal states
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [budgetCategory, setBudgetCategory] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryText, setCustomCategoryText] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");

  const [showAddSaving, setShowAddSaving] = useState(false);
  const [savingName, setSavingName] = useState("");
  const [savingTarget, setSavingTarget] = useState("");
  const [savingCurrent, setSavingCurrent] = useState("");
  const [savingDeadline, setSavingDeadline] = useState("");

  const [fundingGoal, setFundingGoal] = useState<SavingGoal | null>(null);
  const [fundAmount, setFundAmount] = useState("");

  const commonCategories = ["Makan", "Transportasi", "Pribadi", "Kebutuhan", "Hiburan", "Investasi", "Tagihan", "Lainnya"];

  const dynamicCategories = React.useMemo(() => {
    const list = new Set(commonCategories);
    financeRecords.forEach((r: any) => {
      if (r.category && r.category.trim()) {
        list.add(r.category.trim());
      }
    });
    return Array.from(list).sort();
  }, [financeRecords]);

  const handleCreateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = isCustomCategory ? customCategoryText.trim() : budgetCategory;
    const amount = parseFloat(budgetAmount);
    if (!finalCategory || isNaN(amount) || amount <= 0) return;

    playClick();
    addBudget({
      id: uuidv4(),
      category: finalCategory,
      amount: amount
    });

    setBudgetCategory("");
    setCustomCategoryText("");
    setIsCustomCategory(false);
    setBudgetAmount("");
    setShowAddBudget(false);
    playSuccess();
  };

  const handleCreateSaving = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(savingTarget);
    const current = parseFloat(savingCurrent) || 0;
    if (!savingName.trim() || isNaN(target) || target <= 0) return;

    playClick();
    addSaving({
      id: uuidv4(),
      name: savingName.trim(),
      targetAmount: target,
      currentAmount: current,
      deadline: savingDeadline || ""
    });

    setSavingName("");
    setSavingTarget("");
    setSavingCurrent("");
    setSavingDeadline("");
    setShowAddSaving(false);
    playSuccess();
  };

  const handleAddFunds = (e: React.FormEvent) => {
    e.preventDefault();
    const fund = parseFloat(fundAmount);
    if (!fundingGoal || isNaN(fund) || fund <= 0) return;

    playClick();
    const updated = {
      ...fundingGoal,
      currentAmount: Math.min(fundingGoal.currentAmount + fund, fundingGoal.targetAmount)
    };

    updateSaving(updated);
    setFundingGoal(null);
    setFundAmount("");
    playSuccess();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 relative">
      {/* Budgets Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <div>
             <h3 className="font-serif text-2xl font-bold text-stone-900">Anggaran Bulanan</h3>
             <p className="text-stone-500 text-sm">Target maks hemat batas pengeluaran bulanan.</p>
           </div>
           <button 
             onClick={() => { playClick(); setShowAddBudget(true); }}
             className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-md shrink-0"
           >
             <Plus className="w-4 h-4" />
             <span>Atur Anggaran</span>
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map(budget => {
            const spent = financeRecords
              .filter(r => r.type === 'expense' && r.category === budget.category)
              .reduce((sum, r) => sum + r.amount, 0);
            const percent = Math.min((spent / budget.amount) * 100, 100);
            
            return (
              <div key={budget.id} className="bg-white border-2 border-stone-900 rounded-3xl p-6 shadow-brutal transition-transform hover:scale-[1.01]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-stone-900 text-white rounded-xl flex items-center justify-center font-black text-xs">
                      {budget.category[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">{budget.category}</h4>
                      <p className="text-[10px] uppercase font-black tracking-widest text-stone-400">Batas: {formatCurrency(budget.amount)}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => showConfirm(`Hapus anggaran untuk ${budget.category}?`, () => { deleteBudget(budget.id); playError(); })}
                    className="p-2 hover:bg-red-50 text-stone-300 hover:text-red-500 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className={cn(percent > 90 ? "text-red-500 font-black animate-pulse" : "text-stone-400")}>
                      Terpakai: {formatCurrency(spent)}
                    </span>
                    <span className={cn(percent > 90 ? "text-red-500 stroke-2 font-black" : "text-stone-900")}>
                      {percent.toFixed(0)}% {percent >= 90 && "⚠️"}
                    </span>
                  </div>
                  <div className="h-4 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                    <div 
                      className={cn("h-full transition-all duration-1000", percent > 90 ? "bg-red-500" : percent > 70 ? "bg-yellow-500" : "bg-green-500")}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  {percent >= 90 && (
                    <p className="text-[9px] text-red-500 font-black tracking-tight uppercase">Peringatan: Pengeluaran melewati limit 90% budget!</p>
                  )}
                </div>
              </div>
            );
          })}
          
          {budgets.length === 0 && (
            <div className="md:col-span-2 py-12 text-center bg-stone-50 rounded-[2.5rem] border-2 border-dashed border-stone-200">
              <p className="text-stone-400 font-bold mb-4">Belum ada anggaran yang diatur.</p>
              <button 
                onClick={() => { playClick(); setShowAddBudget(true); }}
                className="bg-stone-900 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                Atur Anggaran Pertama
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Saving Goals Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <div>
             <h3 className="font-serif text-2xl font-bold text-stone-900">Target Tabungan</h3>
             <p className="text-stone-500 text-sm">Rencana tabungan mimpi & resolusi masa depan Anda.</p>
           </div>
           <button 
             onClick={() => { playClick(); setShowAddSaving(true); }}
             className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-md shrink-0"
           >
             <Plus className="w-4 h-4" />
             <span>Tambah Target</span>
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savings.map(goal => (
            <div key={goal.id} className="bg-white border-2 border-stone-900 rounded-[2rem] p-6 shadow-brutal group flex flex-col justify-between">
               <div>
                 <div className="flex items-center justify-between mb-4">
                   <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                      <PiggyBank className="w-5 h-5" />
                   </div>
                   <div className="flex gap-1">
                     <button 
                      onClick={() => { setFundingGoal(goal); playClick(); }}
                      className="p-1 px-2.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 rounded-xl transition-all border border-indigo-100 flex items-center gap-1 text-[9px] font-black uppercase tracking-wider"
                      title="Setor Dana ke Tabungan"
                     >
                       <Plus className="w-3.5 h-3.5" />
                       <span>Setor</span>
                     </button>
                     <button 
                      onClick={() => showConfirm(`Hapus target tabungan "${goal.name}"?`, () => { deleteSaving(goal.id); playError(); })}
                      className="p-2 hover:bg-red-50 text-stone-300 hover:text-red-500 rounded-xl transition-all"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                 </div>
                 
                 <h4 className="font-bold text-stone-900 text-base mb-0.5">{goal.name}</h4>
                 <p className="text-[9px] uppercase font-black tracking-widest text-stone-400 mb-4">Deadline: {goal.deadline || '-'}</p>
                 
                 <div className="mb-4">
                   <GoalProgress 
                      current={goal.currentAmount} 
                      total={goal.targetAmount} 
                      label={formatCurrency(goal.currentAmount)} 
                      subLabel={`dari ${formatCurrency(goal.targetAmount)}`}
                      color="#4f46e5"
                   />
                 </div>
               </div>

               <div className="w-full flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-stone-500 pt-2 border-t border-stone-100 mt-2">
                 <span>Tercapai: {Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100)}%</span>
                 {goal.currentAmount >= goal.targetAmount ? (
                   <span className="text-green-600 flex items-center gap-0.5 font-black">LUNAS <Check className="w-3 h-3 stroke-[3]" /></span>
                 ) : (
                   <span className="text-stone-400">Sisa {formatCurrency(Math.max(0, goal.targetAmount - goal.currentAmount))}</span>
                 )}
               </div>
            </div>
          ))}

          {savings.length === 0 && (
            <div className="md:col-span-2 lg:col-span-3 py-12 text-center bg-stone-50 rounded-[2.5rem] border-2 border-dashed border-stone-200">
              <p className="text-stone-400 font-bold mb-4">Belum ada target tabungan.</p>
              <button 
                onClick={() => { playClick(); setShowAddSaving(true); }}
                className="bg-stone-905 bg-stone-900 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                Atur Target Tabungan Pertama
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Modals Implementations */}
      {/* 1. Add Budget Modal */}
      <AnimatePresence>
        {showAddBudget && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddBudget(false)} className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[2rem] border-2 border-stone-900 p-6 md:p-8 shrink-0 max-w-sm w-full relative z-10 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-serif text-xl font-bold text-stone-900">Atur Anggaran Kategori</h4>
                <button onClick={() => setShowAddBudget(false)} className="p-1 hover:bg-stone-100 rounded-lg"><X className="w-5 h-5 text-stone-400" /></button>
              </div>
              <form onSubmit={handleCreateBudget} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-stone-400">Pilih Kategori</label>
                    <button 
                      type="button" 
                      onClick={() => { playClick(); setIsCustomCategory(!isCustomCategory); }}
                      className="text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:underline"
                    >
                      {isCustomCategory ? "Pilih dari Daftar" : "Tulis Kustom"}
                    </button>
                  </div>
                  
                  {isCustomCategory ? (
                    <input 
                      type="text"
                      value={customCategoryText}
                      onChange={e => setCustomCategoryText(e.target.value)}
                      placeholder="Masukkan nama kategori kustom..."
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 outline-none font-bold text-xs"
                      required
                    />
                  ) : (
                    <select 
                      value={budgetCategory} 
                      onChange={e => setBudgetCategory(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 outline-none font-bold text-xs"
                      required
                    >
                      <option value="">-- Silakan Pilih Kategori --</option>
                      {dynamicCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  )}
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-stone-400 block mb-1">Target Limit Anggaran (IDR)</label>
                  <input 
                    type="number" 
                    value={budgetAmount} 
                    onChange={e => setBudgetAmount(e.target.value)} 
                    placeholder="Contoh: 1500000"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 outline-none font-bold text-xs"
                    required 
                  />
                </div>
                <button type="submit" className="w-full py-3 bg-stone-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-stone-800 transition-colors">
                  Atur Limit Anggaran
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Add Saving Goal Modal */}
      <AnimatePresence>
        {showAddSaving && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddSaving(false)} className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[2rem] border-2 border-stone-900 p-6 md:p-8 shrink-0 max-w-sm w-full relative z-10 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-serif text-xl font-bold text-stone-900">Tambah Target Tabungan</h4>
                <button onClick={() => setShowAddSaving(false)} className="p-1 hover:bg-stone-100 rounded-lg"><X className="w-5 h-5 text-stone-400" /></button>
              </div>
              <form onSubmit={handleCreateSaving} className="space-y-4">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-stone-400 block mb-1">Nama Target Tabungan</label>
                  <input 
                    type="text" 
                    value={savingName} 
                    onChange={e => setSavingName(e.target.value)} 
                    placeholder="Contoh: Beli Laptop Baru"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 outline-none font-bold text-xs"
                    required 
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-stone-400 block mb-1">Jumlah Target Tabungan (IDR)</label>
                  <input 
                    type="number" 
                    value={savingTarget} 
                    onChange={e => setSavingTarget(e.target.value)} 
                    placeholder="Contoh: 12000000"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 outline-none font-bold text-xs"
                    required 
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-stone-400 block mb-1">Tabungan Saat Ini (Opsional)</label>
                  <input 
                    type="number" 
                    value={savingCurrent} 
                    onChange={e => setSavingCurrent(e.target.value)} 
                    placeholder="Contoh: 1000000"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 outline-none font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-stone-400 block mb-1">Deadline Waktu (Opsional)</label>
                  <input 
                    type="text" 
                    value={savingDeadline} 
                    onChange={e => setSavingDeadline(e.target.value)} 
                    placeholder="Contoh: Desember 2026 atau 2026-12-31"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 outline-none font-bold text-xs"
                  />
                </div>
                <button type="submit" className="w-full py-3 bg-stone-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-stone-800 transition-colors">
                  Buat Target Tabungan
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Add Funds Top-Up Modal */}
      <AnimatePresence>
        {fundingGoal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFundingGoal(null)} className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[2rem] border-2 border-stone-900 p-6 md:p-8 shrink-0 max-w-sm w-full relative z-10 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="font-serif text-lg font-bold text-stone-900">Setor ke Tabungan</h4>
                  <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest truncate max-w-[250px]">{fundingGoal.name}</p>
                </div>
                <button onClick={() => setFundingGoal(null)} className="p-1 hover:bg-stone-100 rounded-lg"><X className="w-5 h-5 text-stone-400" /></button>
              </div>
              <form onSubmit={handleAddFunds} className="space-y-4">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-stone-400 block mb-1">Jumlah Setor Dana (IDR)</label>
                  <input 
                    type="number" 
                    value={fundAmount} 
                    onChange={e => setFundAmount(e.target.value)} 
                    placeholder="Contoh: 150000"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 outline-none font-bold text-xs"
                    required 
                    autoFocus
                  />
                </div>
                <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors">
                  Konfirmasi Setor
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
