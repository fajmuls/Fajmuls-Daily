import React from 'react';
import { cn } from '../lib/utils';
import * as LucideIcons from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ProgressChartProps {
  data: any[];
  type: "income" | "expense";
  getCategoryColor: (name: string, type: "income" | "expense") => string;
  categoryToIcon: Record<string, string>;
  financeCategoryPrefs: Record<string, any>;
  onItemClick: (item: any, type: "income" | "expense") => void;
}

export function ProgressChart({ data, type, getCategoryColor, categoryToIcon, financeCategoryPrefs, onItemClick }: ProgressChartProps) {
  return (
    <div className="w-full space-y-6">
      <div className="relative h-10 md:h-14 w-full bg-stone-100 rounded-2xl flex overflow-hidden shadow-inner cursor-pointer" title="Click a segment for details">
        {data.map((item, i) => {
          const color = financeCategoryPrefs[item.name]?.color || getCategoryColor(item.name, type);
          const percent = parseFloat(item.displayPercent);
          return (
            <div
              key={i}
              onClick={() => onItemClick(item, type)}
              className="h-full transition-all duration-300 hover:opacity-80"
              style={{ width: `${percent}%`, backgroundColor: color }}
            />
          );
        })}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
