import React from 'react';
import { motion } from 'motion/react';

interface GoalProgressProps {
  current: number;
  total: number;
  label: string;
  subLabel: string;
  color?: string;
}

export function GoalProgress({ current, total, label, subLabel, color = "#4f46e5" }: GoalProgressProps) {
  const percentage = Math.min(100, (current / total) * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <span className="text-3xl font-black text-stone-900 leading-none">{label}</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 mt-1">{subLabel}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xl font-bold text-stone-900 leading-none">{percentage.toFixed(1)}%</span>
        </div>
      </div>

      <div className="h-4 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200/50 shadow-inner">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}
