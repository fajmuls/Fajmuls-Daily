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
  highlightedName?: string | null;
}

export function ProgressChart({ data, type, getCategoryColor, categoryToIcon, financeCategoryPrefs, onItemClick, highlightedName }: ProgressChartProps) {
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

  const topCategories = [...data].sort((a, b) => b.value - a.value).slice(0, 3);

  return (
    <div className="w-full">
      {/* Top 3 Categories Indicators */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
        {topCategories.map((item, i) => {
          const color = financeCategoryPrefs[item.name]?.color || getCategoryColor(item.name, type);
          const prefIcon = financeCategoryPrefs[item.name]?.iconName || categoryToIcon[item.name] || (type === "income" ? "TrendingUp" : "TrendingDown");
          const IconComp = (LucideIcons as any)[prefIcon] || (type === "income" ? TrendingUp : TrendingDown);
          
          return (
            <motion.div 
              key={item.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-full border border-stone-200 shadow-sm"
            >
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: color }}>
                <IconComp className="w-3 h-3" />
              </div>
              <div className="flex flex-col">
                <span className="text-[7px] font-black uppercase text-stone-400 leading-none">{item.name}</span>
                <span className="text-[9px] font-bold text-stone-900">{item.displayPercent}%</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="relative pb-4">
        <div className="relative h-6 md:h-8 w-full bg-stone-100 rounded-full flex overflow-hidden shadow-inner border border-stone-200/50">
          {data.map((item, i) => {
            const color = financeCategoryPrefs[item.name]?.color || getCategoryColor(item.name, type);
            const percent = parseFloat(item.displayPercent);
            const isHighlighted = activeIndex === i;
            
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
                  isHighlighted && "ring-2 ring-offset-2 ring-stone-900/10 z-10 scale-[1.02]"
                )}
                style={{ width: `${percent}%`, backgroundColor: color }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
