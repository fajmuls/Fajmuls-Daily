import React from 'react';
import { Wallet, ListFilter, BarChart3, TrendingUp, Settings, Sparkles, Printer, Download, CheckCircle2, Eye, EyeOff, TrendingDown, Menu } from "lucide-react";
import { cn } from "../../lib/utils";
import { ActionMenu } from "../ActionMenu";

interface FinanceHeaderProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  playClick: () => void;
  setShowAIModal: (val: boolean) => void;
  setShowPrintView: (val: boolean) => void;
  setShowSyncModal: (val: boolean) => void;
  loadBulkData: () => void;
  hideAmounts: boolean;
  setHideAmounts: (val: boolean) => void;
  balance: number;
  totalIncome: number;
  totalExpense: number;
  formatCurrency: (amount: number) => string;
  currency: string;
  setCurrency: (val: any) => void;
  healthScore: number;
}

export function FinanceHeader({
  activeTab,
  setActiveTab,
  playClick,
  setShowAIModal,
  setShowPrintView,
  setShowSyncModal,
  loadBulkData,
  hideAmounts,
  setHideAmounts,
  balance,
  totalIncome,
  totalExpense,
  formatCurrency,
  currency,
  setCurrency,
  healthScore
}: FinanceHeaderProps) {
  const getHealthColor = (score: number) => {
    if (score > 80) return "text-emerald-400";
    if (score > 50) return "text-yellow-400";
    return "text-rose-400";
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-stone-900 text-white rounded-2xl shadow-lg ring-4 ring-stone-100">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">
              Catatan Keuangan
            </h1>
            <p className="text-stone-500 text-sm font-medium">
              Manajemen keuangan mandiri.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-stone-100 p-1 rounded-2xl hidden md:flex flex-wrap">
            {[
              { id: 'records', label: 'Pencatatan', icon: <ListFilter className="w-4 h-4" /> },
              { id: 'analysis', label: 'Analisis', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'ai', label: 'AI Insight', icon: <Sparkles className="w-4 h-4" /> },
              { id: 'planning', label: 'Perencanaan', icon: <TrendingUp className="w-4 h-4" /> },
              { id: 'settings', label: 'Kategori', icon: <Settings className="w-4 h-4" /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); playClick(); }}
                className={cn(
                  "flex items-center gap-2 px-3 md:px-5 py-2 rounded-xl font-bold text-[10px] md:text-sm transition-all",
                  activeTab === tab.id
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-700",
                )}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
          
          <div className="md:hidden flex items-center justify-between w-full">
            <h2 className="font-bold text-stone-900 ml-2">
              {[
                { id: 'records', label: 'Pencatatan' },
                { id: 'analysis', label: 'Analisis' },
                { id: 'ai', label: 'AI Insight' },
                { id: 'planning', label: 'Perencanaan' },
                { id: 'settings', label: 'Kategori' },
              ].find(t => t.id === activeTab)?.label}
            </h2>
            <ActionMenu
              triggerIcon={<Menu className="w-5 h-5 text-stone-600" />}
              items={[
                { label: "Pencatatan", icon: <ListFilter className="w-4 h-4" />, onClick: () => { setActiveTab('records'); playClick(); } },
                { label: "Analisis", icon: <BarChart3 className="w-4 h-4" />, onClick: () => { setActiveTab('analysis'); playClick(); } },
                { label: "AI Insight", icon: <Sparkles className="w-4 h-4" />, onClick: () => { setActiveTab('ai'); playClick(); } },
                { label: "Perencanaan", icon: <TrendingUp className="w-4 h-4" />, onClick: () => { setActiveTab('planning'); playClick(); } },
                { label: "Kategori", icon: <Settings className="w-4 h-4" />, onClick: () => { setActiveTab('settings'); playClick(); } },
                { label: "AI Input Finance", icon: <Sparkles className="w-4 h-4 text-indigo-500" />, onClick: () => setShowAIModal(true) },
                { label: "Cetak Laporan", icon: <Printer className="w-4 h-4" />, onClick: () => { setShowPrintView(true); playClick(); } },
                { label: "Ekspor Akun Workspace", icon: <Download className="w-4 h-4" />, onClick: () => setShowSyncModal(true) },
                { label: "Load Data Histori", icon: <CheckCircle2 className="w-4 h-4" />, onClick: loadBulkData },
                { 
                  label: hideAmounts ? "Tampilkan Saldo" : "Sembunyi Saldo", 
                  icon: hideAmounts ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />, 
                  onClick: () => { setHideAmounts(!hideAmounts); playClick(); } 
                },
              ]}
              triggerClassName="p-2 bg-stone-100 rounded-xl"
            />
          </div>

          <div className="hidden md:block">
            <ActionMenu
              items={[
                { label: "AI Input Finance", icon: <Sparkles className="w-4 h-4" />, onClick: () => setShowAIModal(true) },
                { label: "Cetak Laporan", icon: <Printer className="w-4 h-4" />, onClick: () => { setShowPrintView(true); playClick(); } },
                { label: "Ekspor Akun Workspace", icon: <Download className="w-4 h-4" />, onClick: () => setShowSyncModal(true) },
                { label: "Load Data Histori", icon: <CheckCircle2 className="w-4 h-4" />, onClick: loadBulkData },
                { 
                  label: hideAmounts ? "Tampilkan Saldo" : "Sembunyi Saldo", 
                  icon: hideAmounts ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />, 
                  onClick: () => { setHideAmounts(!hideAmounts); playClick(); } 
                },
              ]}
              triggerClassName="p-1 px-3 h-10 bg-white border border-stone-200 rounded-xl shadow-sm text-stone-600 hover:bg-stone-50"
              iconSize={1.5}
            />
          </div>
        </div>
      </header>

      {/* Main Balance Card */}
      <div className="bg-stone-900 text-white rounded-[2.5rem] p-8 shadow-brutal relative overflow-hidden group border-2 border-stone-900">
        <div className="absolute top-0 right-0 p-6 opacity-5 scale-150 rotate-12 transition-transform group-hover:rotate-0">
          <Wallet className="w-24 h-24" />
        </div>
        <div className="flex justify-between items-start mb-2 relative z-10">
          <p className="text-stone-400 uppercase tracking-widest text-[10px] font-bold mt-2">Saldo Tersedia</p>
          <div className="flex gap-2">
            <div className="p-1 px-4 bg-white/10 rounded-2xl flex flex-col items-end backdrop-blur-sm">
              <span className="text-[8px] font-black uppercase tracking-tighter text-white/50">Health Score</span>
              <div className="flex items-center gap-2">
                <span className={cn("text-sm font-black", getHealthColor(healthScore))}>{healthScore}%</span>
                <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full", healthScore > 80 ? "bg-emerald-400" : healthScore > 50 ? "bg-yellow-400" : "bg-rose-400")}
                    style={{ width: `${healthScore}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="p-1 px-4 bg-white/10 rounded-2xl flex items-center gap-2 backdrop-blur-sm h-fit">
              <div className={cn("w-2 h-2 rounded-full", balance >= 0 ? "bg-green-400" : "bg-red-400 animate-pulse")} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">{balance >= 0 ? "Surplus" : "Defisit"}</span>
            </div>
            <select 
              value={currency} 
              onChange={(e) => { playClick(); setCurrency(e.target.value as any); }}
              className="px-4 bg-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm border-none outline-none cursor-pointer hover:bg-white/20 transition-colors hidden sm:block appearance-none text-center"
            >
              <option value="IDR" className="text-stone-900">IDR</option>
              <option value="USD" className="text-stone-900">USD</option>
              <option value="EUR" className="text-stone-900">EUR</option>
              <option value="JPY" className="text-stone-900">JPY</option>
            </select>
          </div>
        </div>
        <h2 className="text-4xl font-bold tracking-tight mb-8 relative z-10">
          {hideAmounts ? "Rp •••••••" : formatCurrency(balance)}
        </h2>

        <div className="flex items-center justify-between border-t border-white/10 pt-6">
          <div>
            <div className="text-stone-400 text-[10px] uppercase font-black tracking-widest mb-1 flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="w-2.5 h-2.5 text-green-400" />
              </div> Pemasukan
            </div>
            <p className="font-bold text-sm text-green-400">{hideAmounts ? "Rp •••" : formatCurrency(totalIncome)}</p>
          </div>
          <div className="text-right">
            <div className="text-stone-400 text-[10px] uppercase font-black tracking-widest mb-1 flex items-center justify-end gap-1.5">
              Pengeluaran <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center"><TrendingDown className="w-2.5 h-2.5 text-red-400" /></div>
            </div>
            <p className="font-bold text-sm text-red-400">{hideAmounts ? "Rp •••" : formatCurrency(totalExpense)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
