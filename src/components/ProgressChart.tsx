import React from 'react';
import { cn } from '../lib/utils';
import * as LucideIcons from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from "motion/react";

interface ProgressChartProps {
  data: any[];
  type: "income" | "expense";
  getCategoryColor: (name: string, type: "income" | "expense") => string;
  categoryToIcon: Record<string, string>;
  financeCategoryPrefs: Record<string, any>;
  onItemClick: (item: any, type: "income" | "expense") => void;
}

export function ProgressChart({ data, type, getCategoryColor, categoryToIcon, financeCategoryPrefs, onItemClick, highlightedName }: ProgressChartProps & { highlightedName?: string | null }) {
  const [localHighlightedIndex, setLocalHighlightedIndex] = React.useState<number | null>(null);
  
  // Sync with external highlight if provided
  React.useEffect(() => {
    if (highlightedName === undefined) return;
    if (!highlightedName) {
      setLocalHighlightedIndex(null);
      return;
    }
    const idx = data.findIndex(item => item.name === highlightedName);
    if (idx !== -1) setLocalHighlightedIndex(idx);
  }, [highlightedName, data]);

  const activeIndex = highlightedName !== undefined ? (data.findIndex(item => item.name === highlightedName) === -1 ? null : data.findIndex(item => item.name === highlightedName)) : localHighlightedIndex;

  return (
    <div className="w-full space-y-10">
      <div className="relative pt-8 pb-10">
        <div className="relative h-12 md:h-16 w-full bg-stone-100/50 rounded-2xl flex overflow-hidden shadow-inner border border-stone-200/50">
          {data.map((item, i) => {
            const color = financeCategoryPrefs[item.name]?.color || getCategoryColor(item.name, type);
            const percent = parseFloat(item.displayPercent);
            const isHighlighted = activeIndex === i;
            
            const prefIcon = financeCategoryPrefs[item.name]?.iconName || categoryToIcon[item.name] || (type === "income" ? "TrendingUp" : "TrendingDown");
            const IconComp = (LucideIcons as any)[prefIcon] || (type === "income" ? TrendingUp : TrendingDown);

            return (
              <div
                key={i}
                onClick={() => {
                  setLocalHighlightedIndex(isHighlighted ? null : i);
                  onItemClick(item, type);
                }}
                className={cn(
                  "h-full transition-all duration-300 cursor-pointer relative group",
                  activeIndex !== null && !isHighlighted && "opacity-30 scale-95",
                  isHighlighted && "ring-4 ring-offset-4 ring-stone-900/10 z-10 scale-[1.02]"
                )}
                style={{ width: `${percent}%`, backgroundColor: color }}
              >
                {/* Float labels for larger segments */}
                {percent > 8 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
                     <IconComp className="w-4 h-4 text-white/50" />
                  </div>
                )}
                
                {/* Active Indicator Label */}
                <AnimatePresence>
                  {isHighlighted && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-stone-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-xl z-20 flex items-center gap-2"
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      {item.name}: {item.displayPercent}%
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-stone-900 rotate-45" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Grid Lines - Every 10% */}
        <div className="absolute top-[4.5rem] left-0 right-0 h-1 flex justify-between px-0.5 pointer-events-none">
          {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(p => (
            <div key={p} className="flex flex-col items-center">
              <div className={cn("h-2 w-0.5 transition-colors", p % 50 === 0 ? "bg-stone-400" : "bg-stone-200")} />
              {p % 20 === 0 && (
                <span className="text-[7px] font-black text-stone-400 mt-2">{p}%</span>
              )}
            </div>
          ))}
        </div>

        {/* Dynamic labels above/below for all segments if wanted explicitly */}
        <div className="absolute -bottom-8 left-0 right-0 flex gap-1 h-6 overflow-hidden pointer-events-none">
           {data.map((item, i) => {
             const percent = parseFloat(item.displayPercent);
             if (percent < 5) return null;
             const color = financeCategoryPrefs[item.name]?.color || getCategoryColor(item.name, type);
             return (
               <div key={i} style={{ width: `${percent}%` }} className="flex justify-center items-center">
                  <div className="h-1 w-1 rounded-full" style={{ backgroundColor: color }} />
               </div>
             )
           })}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {data.map((item, i) => {
          const color = financeCategoryPrefs[item.name]?.color || getCategoryColor(item.name, type);
          const prefIcon = financeCategoryPrefs[item.name]?.iconName || categoryToIcon[item.name] || (type === "income" ? "TrendingUp" : "TrendingDown");
          const IconProps = (LucideIcons as any)[prefIcon] || (type === "income" ? TrendingUp : TrendingDown);

          return (
            <button
              key={i}
              onClick={() => onItemClick({ payload: { name: item.name } }, type)}
              className="flex items-center gap-3 p-3 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors text-left"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                style={{ backgroundColor: color }}
              >
                <IconProps className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-stone-900 text-xs truncate leading-tight">{item.name}</p>
                <p className="text-[10px] text-stone-500 font-medium">Rp {(item.value / 1000).toLocaleString('id-ID')}k ({item.displayPercent}%)</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
