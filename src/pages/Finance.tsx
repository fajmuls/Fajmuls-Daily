import { useState, FormEvent, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useAppContext } from '../store';
import { FinanceRecord } from '../types';
import { Plus, Minus, Trash2, ChevronDown, Tag, Save, Settings, Eye, EyeOff, X, Wallet } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAudio } from '../hooks/useAudio';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

export function Finance() {
  const { financeRecords, addFinanceRecord, deleteFinanceRecord, showConfirm, financeMappings, updateFinanceMapping, deleteFinanceMapping, hideAmounts, setHideAmounts } = useAppContext();
  const { playSuccess, playError, playClick } = useAudio();
  
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [chartMode, setChartMode] = useState<'detail' | 'grouped'>('detail');
  const [showSettings, setShowSettings] = useState(false);

  // Group mappings management
  const [newGroupCategory, setNewGroupCategory] = useState('');
  const [newGroupName, setNewGroupName] = useState('');

  // Vibrant and distinct colors for income (Bright)
  const COLORS_INCOME = [
    '#22c55e', // Green
    '#0ea5e9', // Sky
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#8b5cf6', // Violet
    '#10b981', // Emerald
    '#f97316', // Orange
    '#3b82f6', // Blue
  ];

  // Distinct dark colors for expenses (Darker theme)
  const COLORS_EXPENSE = [
    '#7f1d1d', // Dark Red
    '#1e3a8a', // Dark Blue
    '#365314', // Dark Lime
    '#581c87', // Dark Purple
    '#7c2d12', // Dark Orange
    '#1c1917', // Gray 900
    '#14532d', // Dark Green
    '#450a0a', // Darker Red
  ];

  const categorySuggestions = useMemo(() => {
    const counts: Record<string, number> = {};
    financeRecords.filter(r => r.type === type).forEach(r => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });

    const defaultCats = type === 'income' ? ['Gaji', 'Bonus', 'Investasi'] : ['Makanan', 'Transportasi', 'Tagihan', 'Belanja'];
    
    const allCatsSet = new Set([...defaultCats]);
    financeRecords.filter(r => r.type === type).forEach(r => allCatsSet.add(r.category));
    
    return Array.from(allCatsSet).sort((a, b) => {
      const countA = counts[a] || 0;
      const countB = counts[b] || 0;
      if (countA !== countB) return countB - countA;
      return a.localeCompare(b);
    });
  }, [financeRecords, type]);

  const parentSuggestions = useMemo(() => {
    const set = new Set<string>();
    if (type === 'expense') {
      ['Kebutuhan', 'Hiburan', 'Kesehatan', 'Tabungan'].forEach(s => set.add(s));
    } else {
      ['UTAMA', 'Sampingan', 'Pasif'].forEach(s => set.add(s));
    }
    financeRecords.filter(r => r.type === type && r.parentCategory).forEach(r => set.add(r.parentCategory!));
    return Array.from(set);
  }, [financeRecords, type]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;

    // Derived parent category from mappings
    const parentCategory = financeMappings[category];

    addFinanceRecord({
      id: uuidv4(),
      amount: parseFloat(amount),
      category,
      parentCategory,
      note,
      type,
      createdAt: Date.now()
    });

    setAmount('');
    setCategory('');
    setNote('');
    playSuccess();
  };

  const totalIncome = financeRecords.reduce((acc, curr) => curr.type === 'income' ? acc + curr.amount : acc, 0);
  const totalExpense = financeRecords.reduce((acc, curr) => curr.type === 'expense' ? acc + curr.amount : acc, 0);
  const balance = totalIncome - totalExpense;

  const incomeData = useMemo(() => {
    const data: Record<string, number> = {};
    let total = 0;
    financeRecords.filter(r => r.type === 'income').forEach(r => {
      // Map to group if in grouped mode
      const key = chartMode === 'grouped' ? (financeMappings[r.category] || 'Lainnya') : r.category;
      data[key] = (data[key] || 0) + r.amount;
      total += r.amount;
    });
    return Object.entries(data).map(([name, value]) => ({ 
      name, 
      value, 
      displayPercent: total > 0 ? (value / total * 100).toFixed(1) : "0" 
    })).sort((a,b) => b.value - a.value);
  }, [financeRecords, chartMode, financeMappings]);

  const expenseData = useMemo(() => {
    const data: Record<string, number> = {};
    let total = 0;
    financeRecords.filter(r => r.type === 'expense').forEach(r => {
      const key = chartMode === 'grouped' ? (financeMappings[r.category] || 'Lainnya') : r.category;
      data[key] = (data[key] || 0) + r.amount;
      total += r.amount;
    });
    return Object.entries(data).map(([name, value]) => ({ 
      name, 
      value, 
      displayPercent: total > 0 ? (value / total * 100).toFixed(1) : "0" 
    })).sort((a,b) => b.value - a.value);
  }, [financeRecords, chartMode, financeMappings]);

  // Helper to get color for a category
  const getCategoryColor = (catName: string, catType: 'income' | 'expense') => {
    const data = catType === 'income' ? incomeData : expenseData;
    const colors = catType === 'income' ? COLORS_INCOME : COLORS_EXPENSE;
    const index = data.findIndex(d => d.name === catName);
    return index !== -1 ? colors[index % colors.length] : '#d6d3d1';
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    // Move labels slightly further out to avoid crowding
    const radius = innerRadius + (outerRadius - innerRadius) * 0.7; 
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show if slice is large enough
    if (percent < 0.08) return null; 
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central" 
        fontSize="11" 
        fontWeight="bold"
        className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-stone-900 text-white p-3 rounded-xl shadow-lg text-sm border border-stone-700">
          <p className="font-bold mb-1 flex items-center gap-2"><Tag className="w-3 h-3"/> {data.name}</p>
          <p className="font-mono">Rp {data.value.toLocaleString('id-ID')}</p>
          <p className="text-stone-400 text-xs mt-1">{data.displayPercent}% dari total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 md:pb-0">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-5xl font-bold text-stone-900">Catatan Keuangan</h1>
          <p className="text-stone-500 text-lg mt-2 font-medium">Lacak pemasukan dan pengeluaran harianmu.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => { setHideAmounts(!hideAmounts); playClick(); }}
            className="p-3 bg-paper border border-stone-200 rounded-2xl text-stone-600 hover:bg-stone-50 transition-all flex items-center gap-2 font-bold text-sm"
          >
            {hideAmounts ? <Eye className="w-4 h-4"/> : <EyeOff className="w-4 h-4"/>}
            {hideAmounts ? "Tampilkan" : "Sembunyikan"}
          </button>
          <button 
            onClick={() => { setShowSettings(true); playClick(); }}
            className="p-3 bg-stone-900 text-white rounded-2xl hover:brightness-110 transition-all flex items-center gap-2 font-bold text-sm"
          >
            <Settings className="w-4 h-4"/>
            Grup Kategori
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-stone-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 scale-150 rotate-12 transition-transform group-hover:rotate-0">
               <Wallet className="w-24 h-24" />
            </div>
            <p className="text-stone-400 uppercase tracking-widest text-[10px] font-bold mb-2">Total Saldo Tersedia</p>
            <h2 className="text-4xl font-sans font-black tracking-tighter mb-6">
              {hideAmounts ? "Rp •••••••" : `Rp ${balance.toLocaleString('id-ID')}`}
            </h2>
            
            <div className="grid grid-cols-1 gap-4 border-t border-white/10 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-stone-500 text-[10px] uppercase tracking-widest font-bold mb-1">Total Pendapatan</p>
                  <p className="text-green-400 font-bold font-sans text-xl">
                    {hideAmounts ? "Rp •••" : `Rp ${totalIncome.toLocaleString('id-ID')}`}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
                   <Plus className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-stone-500 text-[10px] uppercase tracking-widest font-bold mb-1">Total Pengeluaran</p>
                  <p className="text-red-400 font-bold font-sans text-xl">
                    {hideAmounts ? "Rp •••" : `Rp ${totalExpense.toLocaleString('id-ID')}`}
                  </p>
                </div>
                <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                   <Minus className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-paper rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-bold text-lg">Tambah Catatan</h3>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setType('expense'); setCategory(''); setShowCatDropdown(false); playClick(); }}
                className={cn("flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all", type === 'expense' ? "bg-red-100 text-red-700 shadow-sm" : "bg-stone-50 text-stone-500 hover:bg-stone-100")}
              >
                <Minus className="w-5 h-5" /> Keluar
              </button>
              <button
                type="button"
                onClick={() => { setType('income'); setCategory(''); setShowCatDropdown(false); playClick(); }}
                className={cn("flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all", type === 'income' ? "bg-green-100 text-green-700 shadow-sm" : "bg-stone-50 text-stone-500 hover:bg-stone-100")}
              >
                <Plus className="w-5 h-5" /> Masuk
              </button>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wide text-stone-500 font-bold mb-2">Jumlah</label>
              <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">Rp</span>
                 <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required className="w-full bg-stone-50 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-stone-900 font-mono text-lg" placeholder="0" />
              </div>
            </div>

            <div className="relative">
              <label className="block text-xs uppercase tracking-wide text-stone-500 font-bold mb-2 font-sans">Kategori (Otomatis Grup)</label>
              <div className="relative">
                 <input 
                   type="text" 
                   value={category} 
                   onChange={e => { setCategory(e.target.value); setShowCatDropdown(true); }}
                   onFocus={() => setShowCatDropdown(true)}
                   required 
                   className="w-full bg-stone-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-stone-900 pr-10" 
                   placeholder="Cth. Makanan"
                 />
                 <button type="button" onClick={() => setShowCatDropdown(!showCatDropdown)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-stone-400 hover:text-stone-600">
                    <ChevronDown className={cn("w-4 h-4 transition-transform", showCatDropdown ? "rotate-180" : "")} />
                 </button>
              </div>
              
              {showCatDropdown && (
                 <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto overflow-x-hidden p-2 grid grid-cols-2 gap-1 animate-in fade-in slide-in-from-top-2">
                    {categorySuggestions.filter(c => c.toLowerCase().includes(category.toLowerCase())).map((cat, i) => {
                      const catColor = getCategoryColor(cat, type);
                      const group = financeMappings[cat];
                      return (
                        <button 
                          key={i} 
                          type="button" 
                          onClick={() => { setCategory(cat); setShowCatDropdown(false); playClick(); }} 
                          className="text-left px-3 py-2 text-[11px] rounded-lg hover:bg-stone-100 font-medium truncate flex flex-col gap-0.5"
                        >
                           <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: catColor }} />
                             <span className="truncate">{cat}</span>
                           </div>
                           {group && <span className="text-[8px] text-stone-400 uppercase tracking-tighter pl-3.5">Grup: {group}</span>}
                        </button>
                      );
                    })}
                    {categorySuggestions.filter(c => c.toLowerCase().includes(category.toLowerCase())).length === 0 && (
                      <div className="col-span-2 text-center py-4 text-[10px] text-stone-400">Ketik untuk membuat baru "{category}"</div>
                    )}
                 </div>
              )}
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wide text-stone-500 font-bold mb-2">Catatan Tambahan (Opsional)</label>
              <input type="text" value={note} onChange={e => setNote(e.target.value)} className="w-full bg-stone-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-stone-900" placeholder="Opsional" />
            </div>

            <button type="submit" className="w-full bg-stone-900 text-white rounded-xl py-4 font-bold mt-2 hover:bg-stone-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              <Save className="w-5 h-5"/> Simpan Data
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {financeRecords.length > 0 && (
             <div className="space-y-4">
               <div className="flex justify-end gap-2 px-2">
                  <button 
                    onClick={() => setChartMode('detail')}
                    className={cn("px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all", chartMode === 'detail' ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200")}
                  >
                    Detail
                  </button>
                  <button 
                    onClick={() => setChartMode('grouped')}
                    className={cn("px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all", chartMode === 'grouped' ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200")}
                  >
                    Grup
                  </button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {incomeData.length > 0 && (
                    <div className="bg-paper rounded-3xl border border-stone-200 p-6 shadow-sm overflow-hidden flex flex-col h-[420px]">
                       <h3 className="font-bold text-stone-900 mb-2 text-center shrink-0">Distribusi Pendapatan</h3>
                       <div className="flex-1 w-full min-w-0 min-h-0 relative">
                          <ResponsiveContainer width="100%" height="100%">
                          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                            <Pie
                              data={incomeData}
                              cx="50%"
                              cy="50%"
                              innerRadius="43%"
                              outerRadius="90%"
                              paddingAngle={3}
                              dataKey="value"
                              labelLine={false}
                              label={renderCustomizedLabel}
                              isAnimationActive={false}
                              key={`pie-income-${chartMode}-${incomeData.length}`}
                            >
                              {incomeData.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS_INCOME[index % COLORS_INCOME.length]} stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend 
                               verticalAlign="bottom" 
                               align="center"
                               layout="horizontal"
                               iconType="circle" 
                               wrapperStyle={{ paddingTop: '20px', fontSize: '10px' }}
                               formatter={(value) => <span className="text-[10px] font-bold text-stone-600 uppercase tracking-tighter">{value}</span>}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
                )}
                {expenseData.length > 0 && (
                  <div className="bg-paper rounded-3xl border border-stone-200 p-6 shadow-sm overflow-hidden flex flex-col h-[420px]">
                     <h3 className="font-bold text-stone-900 mb-2 text-center shrink-0">Distribusi Pengeluaran</h3>
                     <div className="flex-1 w-full min-w-0 min-h-0 relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                            <Pie
                              data={expenseData}
                              cx="50%"
                              cy="50%"
                              innerRadius="43%"
                              outerRadius="90%"
                              paddingAngle={3}
                              dataKey="value"
                              labelLine={false}
                              label={renderCustomizedLabel}
                              isAnimationActive={false}
                              key={`pie-expense-${chartMode}-${expenseData.length}`}
                            >
                              {expenseData.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS_EXPENSE[index % COLORS_EXPENSE.length]} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend 
                               verticalAlign="bottom" 
                               align="center"
                               layout="horizontal"
                               iconType="circle" 
                               wrapperStyle={{ paddingTop: '20px', fontSize: '10px' }}
                               formatter={(value) => <span className="text-[10px] font-bold text-stone-600 uppercase tracking-tighter">{value}</span>}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
                )}
             </div>
           </div>
         )}

          <div className="bg-paper rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <h3 className="font-bold text-stone-900">Transaksi Terakhir</h3>
            </div>
            {financeRecords.length === 0 ? (
              <div className="p-12 text-center text-stone-400">Belum ada catatan yang ditemukan. Mulai tambahkan data!</div>
            ) : (
              <ul className="divide-y divide-stone-100">
                {financeRecords.map(record => (
                  <li key={record.id} className="p-6 flex items-center justify-between hover:bg-stone-50 transition-colors group relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: getCategoryColor(record.category, record.type) }} />
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0", record.type === 'income' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600")}>
                        {record.type === 'income' ? <Plus className="w-5 h-5"/> : <Minus className="w-5 h-5"/>}
                      </div>
                      <div className="min-w-0 flex flex-col">
                         <p className="font-bold text-stone-900 truncate">{record.category}</p>
                         <p className="text-sm text-stone-500 truncate">{record.note || format(record.createdAt, 'd MMM yyyy', { locale: id })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className={cn("font-bold text-sm md:text-lg font-sans tracking-tight whitespace-nowrap", record.type === 'income' ? "text-green-600" : "text-stone-900")}>
                        {hideAmounts 
                          ? "Rp •••" 
                          : `${record.type === 'income' ? '+' : '-'}Rp ${record.amount.toLocaleString('id-ID')}`
                        }
                      </span>
                      <button onClick={() => { 
                         showConfirm("Hapus transaksi ini?", () => { deleteFinanceRecord(record.id); playError(); });
                      }} className="p-2 text-stone-300 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 opacity-100 md:opacity-0 md:group-hover:opacity-100 shrink-0">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Settings Modal for Category Mapping */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowSettings(false)}
               className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative bg-paper w-full max-w-xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[80vh]"
             >
                <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                   <h3 className="font-serif text-xl font-bold">Grup Kategori</h3>
                   <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-stone-100 rounded-full">
                      <X className="w-5 h-5" />
                   </button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                   <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
                      <h4 className="font-bold text-xs uppercase tracking-widest text-stone-500 mb-4">Tambah Pemetaan Baru</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-400 uppercase">Nama Kategori</label>
                            <input 
                              type="text" 
                              value={newGroupCategory} 
                              onChange={e => setNewGroupCategory(e.target.value)}
                              placeholder="Cth: Makanan"
                              className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-900"
                            />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-400 uppercase">Nama Grup</label>
                            <input 
                              type="text" 
                              value={newGroupName} 
                              onChange={e => setNewGroupName(e.target.value)}
                              placeholder="Cth: Kebutuhan"
                              className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-900"
                            />
                         </div>
                      </div>
                      <button 
                        onClick={() => {
                          if (newGroupCategory && newGroupName) {
                            updateFinanceMapping(newGroupCategory, newGroupName);
                            setNewGroupCategory('');
                            setNewGroupName('');
                            playSuccess();
                          }
                        }}
                        className="w-full mt-4 bg-stone-900 text-white rounded-xl py-3 font-bold text-sm hover:bg-stone-800 transition-all flex items-center justify-center gap-2"
                      >
                         <Plus className="w-4 h-4" /> Tambah Pemetaan
                      </button>
                   </div>

                   <div>
                      <h4 className="font-bold text-xs uppercase tracking-widest text-stone-500 mb-3 px-2">Daftar Pemetaan Saat Ini</h4>
                      {Object.keys(financeMappings).length === 0 ? (
                        <div className="text-center py-8 text-stone-400 text-sm italic">Belum ada pemetaan. Buat grup untuk menampilkan data terpusat di chart.</div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                           {Object.entries(financeMappings).map(([cat, group]) => (
                             <div key={cat} className="bg-white border border-stone-200 rounded-xl p-3 flex items-center justify-between group">
                                <div className="truncate">
                                   <p className="font-bold text-xs text-stone-700 truncate">{cat}</p>
                                   <p className="text-[10px] text-accent-orange font-bold uppercase trekking-widest">{group}</p>
                                </div>
                                <button 
                                  onClick={() => {
                                    showConfirm(`Hapus pemetaan untuk ${cat}?`, () => {
                                       deleteFinanceMapping(cat);
                                    });
                                  }}
                                  className="p-2 text-stone-300 hover:text-red-500 transition-colors md:opacity-0 md:group-hover:opacity-100"
                                >
                                   <Trash2 className="w-4 h-4" />
                                </button>
                             </div>
                           ))}
                        </div>
                      )}
                   </div>
                </div>
                
                <div className="p-6 bg-stone-50 border-t border-stone-100 text-center">
                   <p className="text-[10px] text-stone-400 font-medium italic">Pemetaan ini akan digunakan untuk mengelompokkan kategori pada chart "Mode Grup".</p>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
