import React from 'react';
import { Target, TrendingUp, TrendingDown, PiggyBank, Plus, Trash2, Edit3, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "../../lib/utils";
import { formatCurrency } from "../../lib/financeUtils"; // I should add this to utils or pass it
import { Budget, SavingGoal } from "../../types";
import { ProgressChart } from "../ProgressChart";

interface PlanningViewProps {
  budgets: Budget[];
  savings: SavingGoal[];
  financeRecords: any[];
  addBudget: (b: any) => void;
  deleteBudget: (id: string) => void;
  addSaving: (s: any) => void;
  updateSaving: (id: string, s: any) => void;
  deleteSaving: (id: string) => void;
  showConfirm: (msg: string, onConfirm: () => void) => void;
  playClick: () => void;
  playSuccess: () => void;
  playError: () => void;
  formatCurrencyFn: (amount: number) => string;
}

export function PlanningView({
  budgets,
  savings,
  financeRecords,
  deleteBudget,
  updateSaving,
  deleteSaving,
  showConfirm,
  playClick,
  playError,
  formatCurrencyFn
}: PlanningViewProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Budgets Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <div>
             <h3 className="font-serif text-2xl font-bold text-stone-900">Anggaran Bulanan</h3>
             <p className="text-stone-500 text-sm">Target pengeluaran per kategori.</p>
           </div>
           <Target className="w-8 h-8 text-stone-900 opacity-10" />
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
                      <p className="text-[10px] uppercase font-black tracking-widest text-stone-400">Target: {formatCurrencyFn(budget.amount)}</p>
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
                    <span className={cn(percent > 90 ? "text-red-500" : "text-stone-400")}>Terpakai: {formatCurrencyFn(spent)}</span>
                    <span className="text-stone-900">{percent.toFixed(0)}%</span>
                  </div>
                  <div className="h-4 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                    <div 
                      className={cn("h-full transition-all duration-1000", percent > 90 ? "bg-red-500" : percent > 70 ? "bg-yellow-500" : "bg-green-500")}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          
          {budgets.length === 0 && (
            <div className="md:col-span-2 py-12 text-center bg-stone-50 rounded-[2.5rem] border-2 border-dashed border-stone-200">
              <p className="text-stone-400 font-bold mb-4">Belum ada anggaran yang diatur.</p>
              <button 
                onClick={() => playClick()} // Should trigger add budget modal
                className="bg-stone-900 text-white px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
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
             <p className="text-stone-500 text-sm">Rencana untuk masa depan.</p>
           </div>
           <PiggyBank className="w-8 h-8 text-stone-900 opacity-10" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savings.map(goal => (
            <div key={goal.id} className="bg-white border-2 border-stone-900 rounded-[2.5rem] p-8 shadow-brutal group">
               <div className="flex items-center justify-between mb-6">
                 <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <Target className="w-6 h-6" />
                 </div>
                 <div className="flex gap-1">
                   <button 
                    onClick={() => { playClick(); /* update balance logic */ }}
                    className="p-2 hover:bg-stone-100 text-stone-400 rounded-xl transition-all"
                   >
                     <Plus className="w-4 h-4" />
                   </button>
                   <button 
                    onClick={() => showConfirm(`Hapus target tabungan "${goal.name}"?`, () => { deleteSaving(goal.id); playError(); })}
                    className="p-2 hover:bg-red-50 text-stone-400 hover:text-red-500 rounded-xl transition-all"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                 </div>
               </div>
               
               <h4 className="font-bold text-stone-900 text-lg mb-1">{goal.name}</h4>
               <p className="text-[10px] uppercase font-black tracking-widest text-stone-400 mb-6">Deadline: {goal.deadline}</p>
               
               <div className="mb-6">
                 <ProgressChart 
                    current={goal.current} 
                    total={goal.target} 
                    label={formatCurrencyFn(goal.current)} 
                    subLabel={`dari ${formatCurrencyFn(goal.target)}`}
                    color="#4f46e5"
                 />
               </div>

               <button className="w-full py-3 bg-stone-50 border border-stone-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-stone-600 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all flex items-center justify-center gap-2">
                 Detail Progress <ChevronRight className="w-3 h-3" />
               </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
