import React, { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from "recharts";
import { getCategoryColor, formatCurrency } from "../../lib/financeUtils";

const PieAny = Pie as any;

export function StatsView(props: any) {
  const { 
    records, 
    financeCategoryPrefs,
    activeExpenseIndex,
    setActiveExpenseIndex,
    activeIncomeIndex,
    setActiveIncomeIndex,
    expenseChartData,
    incomeChartData
  } = props;
  
  const handleChartClick = (data: any, type: "income" | "expense") => {
    // maybe navigate or filter history
  };

  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-serif font-black text-sm">{payload.name}</text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="font-sans font-bold text-[10px]">{formatCurrency(value as number)}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={15} textAnchor={textAnchor} fill="#999" className="font-sans font-medium text-[9px]">
          {`(${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Expense Pie Chart */}
      <section className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-serif text-lg font-bold text-stone-900 border-l-4 border-rose-500 pl-3">Proporsi Pengeluaran</h4>
          <span className="text-[10px] uppercase font-black tracking-widest text-stone-400">by Category</span>
        </div>
        <div className="h-64 w-full">
          {expenseChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <PieAny
                  activeIndex={activeExpenseIndex}
                  activeShape={renderActiveShape}
                  data={expenseChartData}
                  cx="50%" cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  onMouseEnter={((_: any, index: number) => setActiveExpenseIndex(index))}
                  onMouseLeave={() => setActiveExpenseIndex(-1)}
                  onClick={(data: any) => handleChartClick(data, "expense")}
                >
                  {expenseChartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name, "expense", financeCategoryPrefs)} />
                  ))}
                </PieAny>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-stone-400 text-xs font-medium italic">Tidak ada data untuk ditampilkan</div>
          )}
        </div>
      </section>

      {/* Income Pie Chart */}
      <section className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-serif text-lg font-bold text-stone-900 border-l-4 border-emerald-500 pl-3">Sumber Pemasukan</h4>
          <span className="text-[10px] uppercase font-black tracking-widest text-stone-400">by Category</span>
        </div>
        <div className="h-64 w-full">
          {incomeChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <PieAny
                  activeIndex={activeIncomeIndex}
                  activeShape={renderActiveShape}
                  data={incomeChartData}
                  cx="50%" cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  onMouseEnter={((_: any, index: number) => setActiveIncomeIndex(index))}
                  onMouseLeave={() => setActiveIncomeIndex(-1)}
                  onClick={(data: any) => handleChartClick(data, "income")}
                >
                  {incomeChartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name, "income", financeCategoryPrefs)} />
                  ))}
                </PieAny>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-stone-400 text-xs font-medium italic">Tidak ada data untuk ditampilkan</div>
          )}
        </div>
      </section>

      {/* Summary or Trend could go here */}
    </div>
  );
}
