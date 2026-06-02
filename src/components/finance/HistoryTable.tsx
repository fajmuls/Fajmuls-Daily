import React from 'react';
import { format, isSameDay } from "date-fns";
import { id } from "date-fns/locale";
import { Trash2, Edit3, ChevronDown, Tag, TrendingDown, TrendingUp, Calendar, Filter } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "../../lib/utils";
import { getCategoryColor, getCategoryIcon } from "../../lib/financeUtils";
import { FinanceRecord } from "../../types";
import { motion, AnimatePresence } from "motion/react";
import { ActionMenu } from "../ActionMenu";

interface HistoryTableProps {
  groupedRecordsByDate: { date: number; records: FinanceRecord[] }[];
  expandedDates: Record<string, boolean>;
  toggleDateExpansion: (date: number) => void;
  formatCurrency: (amount: number) => string;
  deleteFinanceRecord: (id: string) => void;
  setEditingRecord: (record: FinanceRecord) => void;
  setShowAddModal: (val: boolean) => void;
  showConfirm: (msg: string, onConfirm: () => void) => void;
  playError: () => void;
  financeCategoryPrefs: any;
  hideAmounts: boolean;
}

export function HistoryTable({
  groupedRecordsByDate,
  expandedDates,
  toggleDateExpansion,
  formatCurrency,
  deleteFinanceRecord,
  setEditingRecord,
  setShowAddModal,
  showConfirm,
  playError,
  financeCategoryPrefs,
  hideAmounts
}: HistoryTableProps) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between mb-2 px-2">
        <h3 className="font-serif text-xl font-bold text-stone-900">Riwayat Transaksi</h3>
        <div className="flex gap-2">
           <div className="p-2 bg-stone-100 rounded-xl">
             <Filter className="w-4 h-4 text-stone-500" />
           </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {groupedRecordsByDate.map((group) => {
          const dateStr = format(group.date, "yyyy-MM-dd");
          const isExpanded = expandedDates[dateStr] ?? true;
          const dayTotalExpense = group.records
            .filter(r => r.type === 'expense')
            .reduce((sum, r) => sum + r.amount, 0);

          return (
            <div key={dateStr} className="bg-white border-2 border-stone-900 rounded-3xl overflow-hidden shadow-brutal">
              <button
                onClick={() => toggleDateExpansion(group.date)}
                className="w-full px-6 py-4 flex items-center justify-between bg-stone-50 border-b-2 border-stone-900"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="bg-white border-2 border-stone-900 p-2 rounded-xl">
                     <Calendar className="w-4 h-4 text-stone-900" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs md:text-sm uppercase tracking-tighter text-stone-900">
                      {isSameDay(group.date, new Date()) ? "Hari Ini" : format(group.date, "EEEE, d MMM yyyy", { locale: id })}
                    </h4>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{group.records.length} Transaksi</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-black text-xs text-red-500">
                    -{formatCurrency(dayTotalExpense)}
                  </span>
                  <ChevronDown className={cn("w-5 h-5 text-stone-400 transition-transform", isExpanded && "rotate-180")} />
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="divide-y divide-stone-100 overflow-hidden"
                  >
                    {group.records.map((record) => {
                      const iconName = getCategoryIcon(record.category, record.type, financeCategoryPrefs);
                      const IconComp = (LucideIcons as any)[iconName] || Tag;
                      const catColor = getCategoryColor(record.category, record.type, financeCategoryPrefs);

                      return (
                        <div key={record.id} className="p-4 px-6 flex items-center gap-4 hover:bg-stone-50 transition-colors group">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm ring-2 ring-transparent group-hover:ring-stone-200 transition-all active:scale-90"
                            style={{ backgroundColor: catColor }}
                          >
                            <IconComp className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-sm text-stone-900 truncate">{record.category}</h5>
                              {record.parentCategory && (
                                <span className="bg-stone-100 text-stone-400 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md">{record.parentCategory}</span>
                              )}
                            </div>
                            <p className="text-stone-400 text-xs truncate font-medium">{record.note || "Tanpa catatan"}</p>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <div className="flex flex-col items-end">
                              <p className={cn(
                                "font-mono font-black text-sm tracking-tighter",
                                record.type === 'income' ? "text-green-600" : "text-stone-900"
                              )}>
                                {record.type === 'income' ? '+' : '-'}{hideAmounts ? '••••' : formatCurrency(record.amount)}
                              </p>
                              <span className="text-[9px] font-bold text-stone-300 uppercase tracking-widest">{format(record.createdAt, "HH:mm")}</span>
                            </div>
                            
                            <ActionMenu 
                               items={[
                                 {
                                   label: "Edit",
                                   icon: <Edit3 className="w-4 h-4" />,
                                   onClick: () => {
                                      setEditingRecord(record);
                                      setShowAddModal(true);
                                   }
                                 },
                                 {
                                   label: "Hapus",
                                   icon: <Trash2 className="w-4 h-4" />,
                                   onClick: () => showConfirm("Hapus transaksi ini?", () => { deleteFinanceRecord(record.id); playError(); }),
                                   variant: "danger"
                                 }
                               ]}
                               triggerClassName="w-8 h-8 rounded-lg bg-stone-50 border border-stone-100 p-0 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity"
                               iconSize={4}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
        {groupedRecordsByDate.length === 0 && (
          <div className="py-20 text-center bg-stone-50 rounded-[3rem] border-2 border-dashed border-stone-200">
            <div className="bg-white w-16 h-16 rounded-3xl items-center justify-center flex mx-auto mb-4 shadow-sm border border-stone-100">
               <Calendar className="w-8 h-8 text-stone-200" />
            </div>
            <p className="text-stone-400 font-bold">Belum ada transaksi di periode ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
