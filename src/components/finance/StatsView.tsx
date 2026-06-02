import React, { useMemo, useState } from 'react';
import { 
  PieChart, Pie, Cell, Sector, ResponsiveContainer, Tooltip, Legend, 
  LineChart, Line, XAxis, YAxis, CartesianGrid 
} from "recharts";
import { TrendingUp, TrendingDown, Tag, ChevronDown, CheckCircle2 } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { id } from "date-fns/locale";
import { format } from "date-fns";
import { cn } from "../../lib/utils";
import { getCategoryColor, getCategoryIcon } from "../../lib/financeUtils";
import { FinanceRecord } from "../../types";

interface StatsViewProps {
  filteredRecords: FinanceRecord[];
  financeRecords: FinanceRecord[];
  financeCategoryPrefs: any;
  chartMode: "detail" | "grouped";
  setChartMode: (val: "detail" | "grouped") => void;
  categoryToGroup: Record<string, string>;
  trendFilter: "1m" | "4w" | "6m" | "1y" | "2y";
  setTrendFilter: (val: "1m" | "4w" | "6m" | "1y" | "2y") => void;
  selectedWeek: number | 'all';
  setSelectedWeek: (val: number | 'all') => void;
  trendData: any[];
  trendTotals: any;
  incomeChartData: any[];
  expenseChartData: any[];
  expenseData: any[];
  incomeData: any[];
  handleChartClick: (data: any, type: "expense" | "income") => void;
  activeExpenseIndex: number;
  setActiveExpenseIndex: (val: number) => void;
  activeIncomeIndex: number;
  setActiveIncomeIndex: (val: number) => void;
}

export function StatsView({
  filteredRecords,
  financeRecords,
  financeCategoryPrefs,
  chartMode,
  setChartMode,
  categoryToGroup,
  trendFilter,
  setTrendFilter,
  selectedWeek,
  setSelectedWeek,
  trendData,
  trendTotals,
  incomeChartData,
  expenseChartData,
  expenseData,
  incomeData,
  handleChartClick,
  activeExpenseIndex,
  setActiveExpenseIndex,
  activeIncomeIndex,
  setActiveIncomeIndex
}: StatsViewProps) {

  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    const actualName = payload?.payload?.name || payload?.name;
    const isExpense = expenseData.some((d) => d.name === actualName);
    const catType = isExpense ? "expense" : "income";
    const prefIcon = getCategoryIcon(actualName, catType, financeCategoryPrefs);
    const IconProps = (LucideIcons as any)[prefIcon] || (catType === "income" ? TrendingUp : TrendingDown);

    return (
      <g>
        <Sector
          cx={cx} cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 12}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={2} />
        <circle cx={ex} cy={ey} r={3} fill={fill} stroke="none" />
        <foreignObject x={ex + (cos >= 0 ? 1 : -1) * 12 + (cos >= 0 ? 0 : -20)} y={ey - 24} width={20} height={20}>
          <div className="flex items-center justify-center bg-white rounded-full w-full h-full border-2 shadow-sm" style={{ borderColor: fill, color: fill }}>
            <IconProps className="w-2.5 h-2.5" />
          </div>
        </foreignObject>
        <text x={ex + (cos >= 0 ? 1 : -1) * 36} y={ey - 10} textAnchor={textAnchor} fill="#1c1917" className="font-black tracking-tighter text-[11px]">{payload.name}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 36} y={ey + 4} textAnchor={textAnchor} fill="#57534e" className="font-bold font-mono tracking-tighter text-[10px]">Rp {value.toLocaleString("id-ID")}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 36} y={ey + 18} textAnchor={textAnchor} fill="#78716c" className="font-black text-[9px] tracking-widest uppercase">{`${(percent * 100).toFixed(1)}%`}</text>
      </g>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Filters and Mode Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="bg-stone-100 p-1 rounded-2xl flex">
          <button 
            onClick={() => setChartMode("detail")}
            className={cn("px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all", chartMode === "detail" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500")}
          >Kategori</button>
          <button 
            onClick={() => setChartMode("grouped")}
            className={cn("px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all", chartMode === "grouped" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500")}
          >Grup</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Expenses Pie */}
        <div className="bg-white border-2 border-stone-900 rounded-[2.5rem] p-8 shadow-brutal">
          <div className="flex items-center justify-between mb-8">
             <div>
               <h3 className="font-serif text-xl font-bold text-stone-900">Sebaran Pengeluaran</h3>
               <p className="text-[10px] uppercase font-black tracking-widest text-stone-400">Total: Rp {trendTotals.totalPengeluaran.toLocaleString("id-ID")}</p>
             </div>
             <TrendingDown className="w-6 h-6 text-red-500" />
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeExpenseIndex as any}
                  activeShape={renderActiveShape as any}
                  data={expenseChartData}
                  cx="50%" cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  onMouseEnter={(_, index) => setActiveExpenseIndex(index)}
                  onMouseLeave={() => setActiveExpenseIndex(-1)}
                  onClick={(data) => handleChartClick(data, "expense")}
                >
                  {expenseChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name, "expense", financeCategoryPrefs)} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Income Pie */}
        <div className="bg-white border-2 border-stone-900 rounded-[2.5rem] p-8 shadow-brutal">
          <div className="flex items-center justify-between mb-8">
             <div>
               <h3 className="font-serif text-xl font-bold text-stone-900">Sumber Pemasukan</h3>
               <p className="text-[10px] uppercase font-black tracking-widest text-stone-400">Total: Rp {trendTotals.totalPemasukan.toLocaleString("id-ID")}</p>
             </div>
             <TrendingUp className="w-6 h-6 text-green-500" />
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIncomeIndex as any}
                  activeShape={renderActiveShape as any}
                  data={incomeChartData}
                  cx="50%" cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  onMouseEnter={(_, index) => setActiveIncomeIndex(index)}
                  onMouseLeave={() => setActiveIncomeIndex(-1)}
                  onClick={(data) => handleChartClick(data, "income")}
                >
                  {incomeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name, "income", financeCategoryPrefs)} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white border-2 border-stone-900 rounded-[2.5rem] p-8 shadow-brutal">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="font-serif text-2xl font-bold text-stone-900">Tren Keuangan</h3>
            <p className="text-stone-500 text-sm">Visualisasi arus kas masuk dan keluar.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['1m', '4w', '6m', '1y', '2y'] as const).map(t => (
              <button 
                key={t}
                onClick={() => setTrendFilter(t)}
                className={cn("px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", trendFilter === t ? "bg-stone-900 text-white shadow-lg" : "bg-stone-100 text-stone-500 hover:bg-stone-200")}
              >
                {t === '1m' ? '30 Hari' : t === '4w' ? '4 Minggu' : t === '6m' ? '6 Bulan' : t === '1y' ? '1 Tahun' : '2 Tahun'}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[400px] w-full">
           <ResponsiveContainer width="100%" height="100%">
             <LineChart data={trendData}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
               <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#78716c' }} dy={10} />
               <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#78716c' }} />
               <Tooltip />
               <Legend verticalAlign="top" align="right" iconType="circle" />
               <Line type="monotone" dataKey="pemasukan" stroke="#22c55e" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: 'white' }} activeDot={{ r: 8 }} name="Pemasukan" />
               <Line type="monotone" dataKey="pengeluaran" stroke="#ef4444" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: 'white' }} activeDot={{ r: 8 }} name="Pengeluaran" />
               <Line type="monotone" dataKey="tabungan" stroke="#f59e0b" strokeWidth={3} strokeDasharray="5 5" name="Tabungan" dot={false} />
             </LineChart>
           </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
