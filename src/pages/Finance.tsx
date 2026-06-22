import React, { useState, FormEvent, useMemo, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  format,
  isSameDay,
  startOfMonth,
  subMonths,
  subYears,
  subDays,
  isAfter,
} from "date-fns";
import { id } from "date-fns/locale";
import { useAppContext } from "../store";
import { FinanceRecord } from "../types";
import {
  Plus,
  Minus,
  Tag,
  X,
  Calculator,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "../lib/utils";
import { useAudio } from "../hooks/useAudio";
import { motion, AnimatePresence } from "motion/react";

import { WorkspaceSyncModal } from "../components/WorkspaceSyncModal";
import { AddFinanceModal } from "../components/AddFinanceModal";
import { FinanceHeader } from "../components/finance/FinanceHeader";
import { StatsView } from "../components/finance/StatsView";
import { HistoryTable } from "../components/finance/HistoryTable";
import { PlanningView } from "../components/finance/PlanningView";
import { FinanceSettings } from "../components/finance/FinanceSettings";
import { AIInsightTab } from "../components/finance/AIInsightTab";
import { getCategoryColor, getCategoryIcon } from "../lib/financeUtils";
import { ICON_GROUPS } from "../data";

export function Finance() {
  const [showPrintView, setShowPrintView] = useState(false);
  const [currency, setCurrency] = useState<"IDR" | "USD" | "EUR" | "JPY">("IDR");
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    IDR: 1,
    USD: 0.000062,
    EUR: 0.000057,
    JPY: 0.0094
  });

  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/IDR")
      .then(res => res.json())
      .then(data => {
        if (data && data.rates) {
          setExchangeRates({
            IDR: 1,
            USD: data.rates.USD || 0.000062,
            EUR: data.rates.EUR || 0.000057,
            JPY: data.rates.JPY || 0.0094
          });
        }
      })
      .catch((e) => console.log("Failed to fetch exchange rates", e));
  }, []);

  const formatCurrency = (amount: number) => {
    if (currency === "IDR") return `Rp ${amount.toLocaleString("id-ID")}`;
    const converted = amount * exchangeRates[currency];
    const formatter = new Intl.NumberFormat(currency === "USD" ? "en-US" : currency === "EUR" ? "de-DE" : "ja-JP", {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === "JPY" ? 0 : 2
    });
    return formatter.format(converted);
  };

  const {
    financeRecords,
    addFinanceRecord,
    addFinanceRecordsBulk,
    deleteFinanceRecord,
    showConfirm,
    financeMappings,
    updateFinanceMapping,
    deleteFinanceMapping,
    hideAmounts,
    setHideAmounts,
    setAlert,
    financeCategoryPrefs,
    updateCategoryPref,
    updateFinanceCategoryBulk,
    deleteFinanceCategoryBulk,
    budgets,
    addBudget,
    deleteBudget,
    savings,
    addSaving,
    updateSaving,
    deleteSaving,
  } = useAppContext();
  
  const { playSuccess, playError, playClick } = useAudio();

  const [activeTab, setActiveTab] = useState<"records" | "analysis" | "ai" | "settings" | "planning">("records");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [chartMode, setChartMode] = useState<"detail" | "grouped">("detail");
  const [showAIModal, setShowAIModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinanceRecord | null>(null);
  const [addRecordDate, setAddRecordDate] = useState<Date>(new Date());
  const [aiPrompt, setAiPrompt] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string>("Tag");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [selectionSearch, setSelectionSearch] = useState("");
  const [showCalc, setShowCalc] = useState(false);
  const [calcValue, setCalcValue] = useState("");
  
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [filterRange, setFilterRange] = useState<string>("all");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});
  const toggleDateExpansion = (date: number) => {
    const key = format(date, "yyyy-MM-dd");
    setExpandedDates((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [managedGroup, setManagedGroup] = useState<string | null>(null);
  const [mappingViewType, setMappingViewType] = useState<"expense" | "income">("expense");
  const [categoryEdits, setCategoryEdits] = useState<Record<string, any>>({});
  const [pickingIconFor, setPickingIconFor] = useState<string | null>(null);
  const [pickingColorFor, setPickingColorFor] = useState<string | null>(null);
  const [movingCategoryGroup, setMovingCategoryGroup] = useState<string | null>(null);
  const [activeExpenseIndex, setActiveExpenseIndex] = useState<number>(-1);
  const [activeIncomeIndex, setActiveIncomeIndex] = useState<number>(-1);
  const [trendFilter, setTrendFilter] = useState<"1m" | "4w" | "6m" | "1y" | "2y">("1m");
  const [selectedWeek, setSelectedWeek] = useState<number | 'all'>('all');

  const categoryToGroup = useMemo(() => {
    const map: Record<string, string> = {};
    Object.entries(financeMappings).forEach(([group, cats]) => {
      (cats as string[]).forEach((cat) => { map[cat] = group; });
    });
    return map;
  }, [financeMappings]);

  const allCategories = useMemo(() => {
    const set = new Set<string>();
    financeRecords.forEach((r) => set.add(r.category));
    Object.values(financeMappings).forEach(cats => {
      (cats as string[]).forEach(cat => set.add(cat));
    });
    return Array.from(set).sort();
  }, [financeRecords, financeMappings]);

  const unmappedCategories = useMemo(() => {
    return allCategories.filter((cat) => !categoryToGroup[cat]);
  }, [allCategories, categoryToGroup]);

  const filteredRecords = useMemo(() => {
    let records = [...financeRecords];
    const now = new Date();
    if (filterRange === "current_month") {
      records = records.filter((r) => isAfter(new Date(r.createdAt), startOfMonth(now)));
    } else if (filterRange === "this_week") {
      const start = subDays(now, now.getDay() || 7);
      records = records.filter(r => new Date(r.createdAt) >= start);
    } else if (filterRange === "custom") {
      const start = customStartDate ? new Date(customStartDate) : new Date(0);
      const end = customEndDate ? new Date(customEndDate) : new Date(now);
      end.setHours(23, 59, 59, 999);
      records = records.filter(r => { const d = new Date(r.createdAt); return d >= start && d <= end; });
    }
    if (filterCategory !== "All") records = records.filter((r) => r.category === filterCategory);
    return records;
  }, [financeRecords, filterCategory, filterRange, customStartDate, customEndDate]);

  const groupedRecordsByDate = useMemo(() => {
    const groups: { date: number; records: FinanceRecord[] }[] = [];
    filteredRecords.forEach((record) => {
      const existing = groups.find((g) => isSameDay(g.date, record.createdAt));
      if (existing) existing.records.push(record);
      else groups.push({ date: record.createdAt, records: [record] });
    });
    return groups.sort((a, b) => b.date - a.date);
  }, [filteredRecords]);

  const incomeData = useMemo(() => {
    const data: Record<string, number> = {};
    let total = 0;
    filteredRecords.filter((r) => r.type === "income" && r.amount > 0).forEach((r) => {
      const key = chartMode === "grouped" ? categoryToGroup[r.category] || "Lainnya" : r.category;
      data[key] = (data[key] || 0) + r.amount;
      total += r.amount;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value, displayPercent: total > 0 ? ((value / total) * 100).toFixed(1) : "0" })).sort((a, b) => b.value - a.value);
  }, [filteredRecords, chartMode, categoryToGroup]);

  const expenseData = useMemo(() => {
    const data: Record<string, number> = {};
    let total = 0;
    filteredRecords.filter((r) => r.type === "expense" && r.amount > 0).forEach((r) => {
      const key = chartMode === "grouped" ? categoryToGroup[r.category] || "Lainnya" : r.category;
      data[key] = (data[key] || 0) + r.amount;
      total += r.amount;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value, displayPercent: total > 0 ? ((value / total) * 100).toFixed(1) : "0" })).sort((a, b) => b.value - a.value);
  }, [filteredRecords, chartMode, categoryToGroup]);

  const expenseChartData = useMemo(() => {
    const mainData: any[] = [];
    let lainnyaValue = 0;
    let lainnyaPercent = 0;
    expenseData.forEach((item) => {
      const p = parseFloat(item.displayPercent);
      if (p < 3) { lainnyaValue += item.value; lainnyaPercent += p; }
      else mainData.push(item);
    });
    if (lainnyaValue > 0) mainData.push({ name: "Lainnya", value: lainnyaValue, displayPercent: lainnyaPercent.toFixed(1) });
    return mainData;
  }, [expenseData]);

  const incomeChartData = useMemo(() => {
    const mainData: any[] = [];
    let lainnyaValue = 0;
    let lainnyaPercent = 0;
    incomeData.forEach((item) => {
      const p = parseFloat(item.displayPercent);
      if (p < 3) { lainnyaValue += item.value; lainnyaPercent += p; }
      else mainData.push(item);
    });
    if (lainnyaValue > 0) mainData.push({ name: "Lainnya", value: lainnyaValue, displayPercent: lainnyaPercent.toFixed(1) });
    return mainData;
  }, [incomeData]);

  const trendData = useMemo(() => {
    const list: any[] = [];
    const now = new Date();
    if (trendFilter === "1m") {
      for (let i = 29; i >= 0; i--) {
        const d = subDays(now, i);
        list.push({ year: d.getFullYear(), month: d.getMonth(), date: d.getDate(), label: format(d, "dd MMM", { locale: id }), pemasukan: 0, pengeluaran: 0, weekIdx: Math.floor((29-i)/7) });
      }
    } else if (trendFilter === "4w") {
      for (let i = 3; i >= 0; i--) {
        const d = subDays(now, i * 7);
        list.push({ weekIdx: i, label: `Minggu ${4-i}`, pemasukan: 0, pengeluaran: 0, start: subDays(now, (i + 1) * 7), end: subDays(now, i * 7) });
      }
    } else {
      const monthCount = trendFilter === "2y" ? 23 : trendFilter === "1y" ? 11 : 5;
      for (let i = monthCount; i >= 0; i--) {
        const d = subMonths(now, i);
        list.push({ year: d.getFullYear(), month: d.getMonth(), label: format(d, "MMM yy", { locale: id }), pemasukan: 0, pengeluaran: 0 });
      }
    }

    financeRecords.forEach((record) => {
      const recordDate = new Date(record.createdAt);
      let item = null;
      if (trendFilter === "1m") item = list.find((m) => m.year === recordDate.getFullYear() && m.month === recordDate.getMonth() && m.date === recordDate.getDate());
      else if (trendFilter === "4w") item = list.find((m) => recordDate >= m.start && recordDate <= m.end);
      else item = list.find((m) => m.year === recordDate.getFullYear() && m.month === recordDate.getMonth());
      
      if (item) {
        if (record.type === "income") item.pemasukan += record.amount;
        else item.pengeluaran += record.amount;
      }
    });

    list.forEach((item) => { item.tabungan = item.pemasukan - item.pengeluaran; });
    if (trendFilter === "1m" && selectedWeek !== 'all') return list.filter(i => i.weekIdx === selectedWeek);
    return list;
  }, [financeRecords, trendFilter, selectedWeek]);

  const trendTotals = useMemo(() => {
    let tp = 0, tex = 0;
    trendData.forEach(i => { tp += i.pemasukan; tex += i.pengeluaran; });
    return { totalPemasukan: tp, totalPengeluaran: tex, totalTabungan: tp - tex };
  }, [trendData]);

  const totalIncome = financeRecords.reduce((acc, curr) => (curr.type === "income" ? acc + curr.amount : acc), 0);
  const totalExpense = financeRecords.reduce((acc, curr) => (curr.type === "expense" ? acc + curr.amount : acc), 0);
  const balance = totalIncome - totalExpense;

  const healthScore = useMemo(() => {
    if (totalIncome === 0) return 50;
    const savingsRate = balance / totalIncome;
    // Score components: 
    // Savings rate (max 50 points): > 30% = 50, 0% = 25, < 0% = 0-25
    let score = 0;
    if (savingsRate > 0.3) score += 50;
    else if (savingsRate > 0) score += 25 + (savingsRate / 0.3) * 25;
    else score += Math.max(0, 25 + (savingsRate * 25));

    // Budget compliance (max 50 points)
    const totalBudget = budgets.reduce((acc, curr) => acc + curr.amount, 0);
    if (totalBudget > 0) {
      const budgetUsage = totalExpense / totalBudget;
      if (budgetUsage < 0.8) score += 50;
      else if (budgetUsage < 1) score += 30 + (1 - budgetUsage) * 100;
      else score += Math.max(0, 30 - (budgetUsage - 1) * 50);
    } else {
      score += 25; // Neutral if no budget
    }
    
    return Math.min(100, Math.round(score));
  }, [totalIncome, totalExpense, balance, budgets]);

  const getHealthColor = (score: number) => {
    if (score > 80) return "text-emerald-500";
    if (score > 50) return "text-yellow-500";
    return "text-rose-500";
  };

  const handleAIParsing = async () => {
    if (!aiPrompt.trim()) return;
    setIsParsing(true);
    try {
      const response = await fetch("/api/finance/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt, categories: allCategories }),
      });
      const data = await response.json();
      if (data.records && data.records.length > 0) {
        const newRecords = data.records.map((r: any) => ({
          ...r,
          id: uuidv4(),
          createdAt: Date.now(),
          parentCategory: categoryToGroup[r.category] || undefined,
          iconName: r.iconName || (r.type === "income" ? "TrendingUp" : "Tag"),
        }));
        await addFinanceRecordsBulk(newRecords);
        setAiPrompt("");
        setShowAIModal(false);
        playSuccess();
        setAlert(`Berhasil menambahkan ${newRecords.length} catatan.`);
      } else {
        setAlert("Gagal memproses teks.");
      }
    } catch (e) { console.error(e); setAlert("Kesalahan sistem."); }
    finally { setIsParsing(false); }
  };

  const loadBulkData = () => {
    const rawData = [
      { category: "Investasi kripto", amount: 1800000, type: "expense" as const },
      { category: "BBM dan parkir", amount: 1164000, type: "expense" as const },
      { category: "Makan", amount: 829000, type: "expense" as const },
      { category: "Belanja online", amount: 828000, type: "expense" as const },
    ];
    const rs: FinanceRecord[] = rawData.map((d, i) => ({ 
      id: uuidv4(), 
      amount: d.amount, 
      category: d.category, 
      type: d.type, 
      note: "Data Histori",
      createdAt: Date.now() - i * 1000 
    }));
    showConfirm(`Tambahkan ${rs.length} data histori?`, () => { addFinanceRecordsBulk(rs); playSuccess(); });
  };

  const handleMoveCategory = (cat: string, newGroup: string | null) => {
    const currentGroup = categoryToGroup[cat];
    if (currentGroup) updateFinanceMapping(currentGroup, (financeMappings[currentGroup] as string[] || []).filter(c => c !== cat));
    if (newGroup) updateFinanceMapping(newGroup, [...(financeMappings[newGroup] as string[] || []), cat]);
    setMovingCategoryGroup(null);
    playSuccess();
  };

  const getCatEdit = (cat: string) => {
    if (categoryEdits[cat]) return categoryEdits[cat];
    const isGroup = !!financeMappings[cat];
    const isIncome = financeRecords.some(r => r.category === cat && r.type === 'income');
    const pref = financeCategoryPrefs[cat];
    if (isGroup) {
      return {
        name: cat,
        iconName: pref?.iconName || 'Folder',
        color: pref?.color || '#78716c'
      };
    }
    return {
      name: cat,
      iconName: pref?.iconName || (isIncome ? 'TrendingUp' : 'Tag'),
      color: pref?.color || (isIncome ? '#10b981' : '#ef4444')
    };
  };

  const renderCategoryItemUI = (cat: string, editObj: any) => {
    return (
      <div className="flex items-center gap-3">
        <div className="relative group/btn">
          <button
            onClick={() => setPickingIconFor(pickingIconFor === cat ? null : cat)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
            style={{ backgroundColor: editObj.color }}
          >
            {React.createElement((LucideIcons as any)[editObj.iconName] || Tag, { className: "w-5 h-5" })}
          </button>
          <button
            onClick={() => setPickingColorFor(pickingColorFor === cat ? null : cat)}
            className="absolute -bottom-1 -right-1 w-4 h-4 bg-white border border-stone-200 rounded-full flex items-center justify-center opacity-0 group-hover/btn:opacity-100 transition-opacity"
            title="Edit Warna"
          >
            <div className="w-2 h-2 rounded-full bg-stone-900" />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <p className="w-full bg-transparent font-bold text-stone-900 outline-none text-xs break-words whitespace-normal">{editObj.name}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      <FinanceHeader 
        activeTab={activeTab} setActiveTab={setActiveTab} playClick={playClick}
        setShowAIModal={setShowAIModal} setShowPrintView={setShowPrintView}
        setShowSyncModal={setShowSyncModal} loadBulkData={loadBulkData}
        hideAmounts={hideAmounts} setHideAmounts={setHideAmounts}
        balance={balance} totalIncome={totalIncome} totalExpense={totalExpense}
        formatCurrency={formatCurrency} currency={currency} setCurrency={setCurrency}
        healthScore={healthScore}
      />

      <div className="mt-8">
        {activeTab === "records" && (
          <HistoryTable 
            groupedRecordsByDate={groupedRecordsByDate} expandedDates={expandedDates}
            toggleDateExpansion={toggleDateExpansion} formatCurrency={formatCurrency}
            deleteFinanceRecord={deleteFinanceRecord} setEditingRecord={setEditingRecord}
            setShowAddModal={setShowAddModal} showConfirm={showConfirm} playError={playError}
            financeCategoryPrefs={financeCategoryPrefs} hideAmounts={hideAmounts}
            filterCategory={filterCategory} setFilterCategory={setFilterCategory}
            filterRange={filterRange} setFilterRange={setFilterRange}
            allCategories={allCategories}
          />
        )}

        {activeTab === "analysis" && (
          <StatsView 
            filteredRecords={filteredRecords} 
            financeRecords={financeRecords}
            financeCategoryPrefs={financeCategoryPrefs} 
            chartMode={chartMode} 
            setChartMode={setChartMode}
            categoryToGroup={categoryToGroup} 
            trendFilter={trendFilter} 
            setTrendFilter={setTrendFilter}
            selectedWeek={selectedWeek} 
            setSelectedWeek={setSelectedWeek}
            trendData={trendData} 
            trendTotals={trendTotals}
            incomeChartData={incomeChartData} 
            expenseChartData={expenseChartData}
            expenseData={expenseData} 
            incomeData={incomeData}
            handleChartClick={() => {}} 
            activeExpenseIndex={activeExpenseIndex}
            setActiveExpenseIndex={setActiveExpenseIndex} 
            activeIncomeIndex={activeIncomeIndex}
            setActiveIncomeIndex={setActiveIncomeIndex}
            formatCurrency={formatCurrency}
          />
        )}

        {activeTab === "ai" && <AIInsightTab financeRecords={financeRecords} />}

        {activeTab === "planning" && (
          <PlanningView 
            budgets={budgets} savings={savings} financeRecords={financeRecords}
            addBudget={addBudget} deleteBudget={deleteBudget} addSaving={addSaving}
            updateSaving={updateSaving} deleteSaving={deleteSaving} showConfirm={showConfirm}
            playClick={playClick} playSuccess={playSuccess} playError={playError}
          />
        )}

        {activeTab === "settings" && (
          <FinanceSettings 
            financeMappings={financeMappings} allCategories={allCategories}
            unmappedCategories={unmappedCategories} categoryToGroup={categoryToGroup}
            managedGroup={managedGroup} setManagedGroup={setManagedGroup}
            updateFinanceMapping={updateFinanceMapping} deleteFinanceMapping={deleteFinanceMapping}
            showConfirm={showConfirm} playClick={playClick} playSuccess={playSuccess} playError={playError}
            categoryEdits={categoryEdits} setCategoryEdits={setCategoryEdits}
            pickingIconFor={pickingIconFor} setPickingIconFor={setPickingIconFor}
            pickingColorFor={pickingColorFor} setPickingColorFor={setPickingColorFor}
            movingCategoryGroup={movingCategoryGroup} setMovingCategoryGroup={setMovingCategoryGroup}
            financeCategoryPrefs={financeCategoryPrefs} updateCategoryPref={updateCategoryPref}
            deleteFinanceCategoryBulk={deleteFinanceCategoryBulk}
            getCatEdit={getCatEdit} renderCategoryItemUI={renderCategoryItemUI}
          />
        )}
      </div>

      <WorkspaceSyncModal isOpen={showSyncModal} onClose={() => setShowSyncModal(false)} contextType="finance" />
      <AddFinanceModal 
        isOpen={showAddModal} 
        onClose={() => { setShowAddModal(false); setEditingRecord(null); }}
        addFinanceRecord={addFinanceRecord}
        financeRecords={financeRecords}
        categoryToGroup={categoryToGroup}
        financeMappings={financeMappings}
        financeCategoryPrefs={financeCategoryPrefs}
        updateCategoryPref={updateCategoryPref}
        updateFinanceMapping={updateFinanceMapping}
        playSuccess={playSuccess}
        playClick={playClick}
        initialRecord={editingRecord}
      />
    </div>
  );
}
