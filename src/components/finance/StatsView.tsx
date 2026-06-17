import React, { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from "recharts";
import { getCategoryColor, getCategoryIcon, formatCurrency } from "../../lib/financeUtils";
import * as LucideIcons from "lucide-react";

const PieAny = Pie as any;

const CustomTooltip = ({ active, payload, financeCategoryPrefs, type }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const IconName = getCategoryIcon(data.name, type, financeCategoryPrefs) || 'Tag';
    const IconComp = (LucideIcons as any)[IconName] || LucideIcons.Tag;
    
    return (
      <div className="bg-stone-900 text-white p-3 rounded-2xl shadow-xl border border-stone-700 min-w-[120px] max-w-[250px] z-50">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-stone-800 flex items-center justify-center shrink-0" style={{ backgroundColor: getCategoryColor(data.name, type, financeCategoryPrefs) }}>
             <IconComp className="w-3 h-3 text-white" />
          </div>
          <p className="font-bold text-xs truncate break-all">{data.name}</p>
        </div>
        <p className={`font-mono text-sm font-black ${type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>{formatCurrency(data.value)}</p>
      </div>
    );
  }
  return null;
};

export function StatsView(props: any) {
  const { financeRecords, financeCategoryPrefs } = props;
  const [activeExpenseIndex, setActiveExpenseIndex] = useState(-1);
  const [activeIncomeIndex, setActiveIncomeIndex] = useState(-1);

  const expenseRecords = financeRecords.filter((r: any) => r.type === "expense");
  const incomeRecords = financeRecords.filter((r: any) => r.type === "income");

  const expenseChartData = useMemo(() => {
    const grouped = expenseRecords.reduce((acc: any, curr: any) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value })).sort((a: any, b: any) => (b.value as number) - (a.value as number));
  }, [expenseRecords]);

  const incomeChartData = useMemo(() => {
    const grouped = incomeRecords.reduce((acc: any, curr: any) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value })).sort((a: any, b: any) => (b.value as number) - (a.value as number));
  }, [incomeRecords]);

  const handleChartClick = (data: any, type: string) => {};

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} />
        <Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle} innerRadius={outerRadius + 12} outerRadius={outerRadius + 15} fill={fill} />
      </g>
    );
  };

  const renderCategoryListVertical = (dataList: any[], type: 'expense' | 'income') => {
    if (dataList.length === 0) return null;
    const total = dataList.reduce((sum, item) => sum + item.value, 0);
    return (
      <div className="space-y-3">
        <h5 className="text-[10px] uppercase font-black tracking-widest text-stone-400 mb-2 border-b border-stone-100 pb-2">Detail Analisis</h5>
        <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-stone-200">
          {dataList.map((item, idx) => {
            const IconName = getCategoryIcon(item.name, type, financeCategoryPrefs) || 'Tag';
            const IconComp = (LucideIcons as any)[IconName] || LucideIcons.Tag;
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <div key={idx} className="bg-stone-50 border border-stone-100 p-3 rounded-2xl flex items-center justify-between group hover:border-stone-900 transition-colors">
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: getCategoryColor(item.name, type, financeCategoryPrefs) }}>
                    <IconComp className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-stone-900 text-[11px] truncate">{item.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-16 h-1 bg-stone-200 rounded-full overflow-hidden">
                        <div className="h-full bg-stone-900" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="font-mono text-[8px] text-stone-400 font-bold tracking-wider">{pct}%</p>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-mono text-[11px] font-black ${type === 'income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {formatCurrency(item.value)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-10">
      <section className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm w-full mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-serif text-lg font-bold text-stone-900 border-l-4 border-rose-500 pl-3">Proporsi Pengeluaran</h4>
          <span className="text-[10px] uppercase font-black tracking-widest text-stone-400">by Category</span>
        </div>
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="h-64 w-full lg:w-1/2 relative">
            {expenseChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <PieAny activeIndex={activeExpenseIndex} activeShape={renderActiveShape} data={expenseChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} dataKey="value" onMouseEnter={((_: any, index: number) => setActiveExpenseIndex(index))} onMouseLeave={() => setActiveExpenseIndex(-1)} onClick={(data: any) => handleChartClick(data, "expense")}>
                    {expenseChartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name, "expense", financeCategoryPrefs)} />
                    ))}
                  </PieAny>
                  <Tooltip content={<CustomTooltip financeCategoryPrefs={financeCategoryPrefs} type="expense" />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-stone-400 text-xs font-medium italic">Tidak ada data untuk ditampilkan</div>
            )}
          </div>
          <div className="w-full lg:w-1/2">
            {renderCategoryListVertical(expenseChartData, 'expense')}
          </div>
        </div>
      </section>

      <section className="bg-white p-6 rounded-[2.5rem] border-2 border-stone-900 shadow-brutal w-full mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-serif text-lg font-bold text-stone-900 border-l-4 border-emerald-500 pl-3">Sumber Pemasukan</h4>
          <span className="text-[10px] uppercase font-black tracking-widest text-stone-400">by Category</span>
        </div>
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="h-64 w-full lg:w-1/2 relative">
            {incomeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <PieAny activeIndex={activeIncomeIndex} activeShape={renderActiveShape} data={incomeChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} dataKey="value" onMouseEnter={((_: any, index: number) => setActiveIncomeIndex(index))} onMouseLeave={() => setActiveIncomeIndex(-1)} onClick={(data: any) => handleChartClick(data, "income")}>
                    {incomeChartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name, "income", financeCategoryPrefs)} />
                    ))}
                  </PieAny>
                  <Tooltip content={<CustomTooltip financeCategoryPrefs={financeCategoryPrefs} type="income" />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-stone-400 text-xs font-medium italic">Tidak ada data untuk ditampilkan</div>
            )}
          </div>
          <div className="w-full lg:w-1/2">
            {renderCategoryListVertical(incomeChartData, 'income')}
          </div>
        </div>
      </section>
    </div>
  );
}
