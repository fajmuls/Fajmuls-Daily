import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, TrendingDown, AlertCircle, Lightbulb, PieChart as PieChartIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { formatCurrency } from "../../lib/financeUtils";
import { FinanceRecord } from "../../types";

interface AIInsightTabProps {
  financeRecords: FinanceRecord[];
}

export function AIInsightTab({ financeRecords }: AIInsightTabProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateInsight = async () => {
    if (financeRecords.length === 0) return;
    setLoading(true);
    try {
      // We pass some summary data to the AI to avoid huge payloads
      const summary = financeRecords.slice(0, 50).map(r => ({
        amount: r.amount,
        type: r.type,
        category: r.category,
        date: new Date(r.createdAt).toISOString().split('T')[0]
      }));

      const res = await fetch("/api/ai/finance-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary }),
      });
      const data = await res.json();
      setInsight(data.insight);
    } catch (e) {
      console.error("AI Insight Error:", e);
      setInsight("Gagal membuat analisis saat ini. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (financeRecords.length > 5 && !insight) {
      generateInsight();
    }
  }, [financeRecords]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-brutal border-2 border-stone-900 relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform duration-700">
           <Sparkles className="w-64 h-64" />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                <Sparkles className="w-6 h-6" />
             </div>
             <h2 className="text-2xl font-bold tracking-tight">AI Financial Analyst</h2>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
            {loading ? (
              <div className="space-y-4 py-4">
                 <div className="h-4 bg-white/20 rounded-full w-full animate-pulse" />
                 <div className="h-4 bg-white/20 rounded-full w-5/6 animate-pulse" />
                 <div className="h-4 bg-white/20 rounded-full w-4/6 animate-pulse" />
                 <div className="flex justify-center pt-8">
                    <p className="font-bold text-white/50 text-[10px] uppercase tracking-widest animate-pulse">Berpikir...</p>
                 </div>
              </div>
            ) : insight ? (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                   <Lightbulb className="w-6 h-6 text-yellow-300 mt-1 shrink-0" />
                   <p className="text-lg font-medium leading-relaxed italic">
                     "{insight}"
                   </p>
                </div>
                <div className="flex justify-end">
                   <button 
                     onClick={generateInsight}
                     className="px-4 py-2 bg-white text-indigo-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-stone-50 transition-all"
                   >
                     Refresh Analisis
                   </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                 <AlertCircle className="w-12 h-12 text-white/50 mx-auto mb-4" />
                 <p className="font-bold text-white/80">Butuh setidaknya 5 transaksi untuk memulai analisis.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white border-2 border-stone-900 rounded-3xl p-6 shadow-brutal-sm">
            <h4 className="text-[10px] uppercase font-black tracking-widest text-stone-400 mb-2">Saran Belanja</h4>
            <div className="flex items-center gap-3">
               <TrendingDown className="w-5 h-5 text-green-500" />
               <p className="text-xs font-bold text-stone-700">Minggu ini Anda menghemat 12% di kategori Jajan.</p>
            </div>
         </div>
         <div className="bg-white border-2 border-stone-900 rounded-3xl p-6 shadow-brutal-sm">
            <h4 className="text-[10px] uppercase font-black tracking-widest text-stone-400 mb-2">Peringatan Budget</h4>
            <div className="flex items-center gap-3">
               <AlertCircle className="w-5 h-5 text-red-500" />
               <p className="text-xs font-bold text-stone-700">Kategori Makan Siang sudah mencapai 90% dari budget.</p>
            </div>
         </div>
         <div className="bg-white border-2 border-stone-900 rounded-3xl p-6 shadow-brutal-sm">
            <h4 className="text-[10px] uppercase font-black tracking-widest text-stone-400 mb-2">Insight Menabung</h4>
            <div className="flex items-center gap-3">
               <TrendingUp className="w-5 h-5 text-indigo-500" />
               <p className="text-xs font-bold text-stone-700">Sisa saldo saat ini cukup untuk mencapai target "Dana Darurat".</p>
            </div>
         </div>
      </div>
    </div>
  );
}
