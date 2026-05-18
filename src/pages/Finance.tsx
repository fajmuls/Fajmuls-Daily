import { useState, FormEvent, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useAppContext } from '../store';
import { FinanceRecord } from '../types';
import { Plus, Minus, Trash2, ChevronDown, Tag, Save, Wallet } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAudio } from '../hooks/useAudio';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export function Finance() {
  const { financeRecords, addFinanceRecord, deleteFinanceRecord } = useAppContext();
  const { playSuccess, playError, playClick } = useAudio();
  
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [showCatDropdown, setShowCatDropdown] = useState(false);

  const categorySuggestions = useMemo(() => {
    const categories = new Set<string>();
    if (type === 'income') {
       categories.add('Gaji'); categories.add('Bonus'); categories.add('Investasi');
    } else {
       categories.add('Makanan'); categories.add('Transportasi'); categories.add('Tagihan'); categories.add('Belanja');
    }
    
    financeRecords.forEach(r => {
      if (r.type === type) categories.add(r.category);
    });
    return Array.from(categories);
  }, [financeRecords, type]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;

    addFinanceRecord({
      id: uuidv4(),
      amount: parseFloat(amount),
      category,
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
      data[r.category] = (data[r.category] || 0) + r.amount;
      total += r.amount;
    });
    return Object.entries(data).map(([name, value]) => ({ 
      name, 
      value, 
      percentage: total > 0 ? (value / total * 100).toFixed(1) : '0' 
    })).sort((a,b) => b.value - a.value);
  }, [financeRecords]);

  const expenseData = useMemo(() => {
    const data: Record<string, number> = {};
    let total = 0;
    financeRecords.filter(r => r.type === 'expense').forEach(r => {
      data[r.category] = (data[r.category] || 0) + r.amount;
      total += r.amount;
    });
    return Object.entries(data).map(([name, value]) => ({ 
      name, 
      value, 
      percentage: total > 0 ? (value / total * 100).toFixed(1) : '0' 
    })).sort((a,b) => b.value - a.value);
  }, [financeRecords]);

  // Bright, diverse colors for Income
  const COLORS_INCOME = [
    '#00E676', // Bright Green
    '#00B0FF', // Bright Blue
    '#FFEA00', // Bright Yellow
    '#AA00FF', // Purple
    '#FF3D00', // Deep Orange
    '#1DE9B6'  // Teal
  ];
  
  // Muted, darker, diverse colors for Expenses
  const COLORS_EXPENSE = [
    '#1A237E', // Dark Blue
    '#311B92', // Deep Purple
    '#004D40', // Dark Teal
    '#1B5E20', // Dark Green
    '#B71C1C', // Dark Red
    '#E65100', // Dark Orange
    '#3E2723', // Dark Brown
    '#212121'  // Carbon
  ];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // hide very small labels
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="10" fontVariant="tabular-nums" fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-stone-900/95 text-white p-3 rounded-xl shadow-2xl text-sm border border-stone-700/50 backdrop-blur-md">
          <p className="font-bold mb-1 flex items-center gap-2"><Tag className="w-3 h-3 text-accent-orange"/> {data.name}</p>
          <p className="font-mono text-lg">Rp {data.value.toLocaleString('id-ID')}</p>
          <p className="text-stone-400 text-xs mt-1 font-bold">{data.percentage}% dari total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 md:pb-0 max-w-5xl mx-auto">
      <header>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Manajemen Keuangan</h1>
          <p className="text-slate-500 font-medium">Lacak pemasukan dan pengeluaran harianmu.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card text-white rounded-[2rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-10">
                <Wallet className="w-20 h-20" />
             </div>
            <p className="text-slate-500 uppercase tracking-widest text-[10px] font-black mb-1">Total Saldo</p>
            <h2 className="text-4xl font-black mb-8 tracking-tight">Rp {balance.toLocaleString('id-ID')}</h2>
            
            <div className="grid grid-cols-2 gap-6 border-t border-white/5 pt-6">
              <div>
                <p className="text-slate-500 text-[10px] uppercase tracking-widest font-black mb-1">Pemasukan</p>
                <p className="text-green-400 font-black text-sm">Rp {totalIncome.toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] uppercase tracking-widest font-black mb-1">Pengeluaran</p>
                <p className="text-red-400 font-black text-sm">Rp {totalExpense.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="glass-card rounded-[2rem] p-8 border border-white/5 shadow-xl space-y-6">
            <h3 className="font-bold text-lg text-white">Tambah Catatan</h3>
            
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
              <button
                type="button"
                onClick={() => { setType('expense'); setCategory(''); setShowCatDropdown(false); playClick(); }}
                className={cn("flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all text-xs", type === 'expense' ? "bg-red-500 text-white shadow-lg" : "text-slate-400 hover:text-white")}
              >
                <Minus className="w-4 h-4" /> Keluar
              </button>
              <button
                type="button"
                onClick={() => { setType('income'); setCategory(''); setShowCatDropdown(false); playClick(); }}
                className={cn("flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all text-xs", type === 'income' ? "bg-green-500 text-white shadow-lg" : "text-slate-400 hover:text-white")}
              >
                <Plus className="w-4 h-4" /> Masuk
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Nominal</label>
              <div className="relative group">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black text-xs">Rp</span>
                 <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-accent-blue font-black text-xl text-white transition-all" placeholder="0" />
              </div>
            </div>

            <div className="relative space-y-2">
              <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Kategori</label>
              <div className="relative">
                 <input 
                   type="text" 
                   value={category} 
                   onChange={e => { setCategory(e.target.value); setShowCatDropdown(true); }}
                   onFocus={() => setShowCatDropdown(true)}
                   required 
                   className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-accent-blue pr-12 text-white font-bold" 
                   placeholder="Cth. Makanan"
                 />
                 <button type="button" onClick={() => setShowCatDropdown(!showCatDropdown)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-white transition-colors">
                    <ChevronDown className={cn("w-5 h-5 transition-transform", showCatDropdown ? "rotate-180" : "")} />
                 </button>
              </div>
              
              {showCatDropdown && (
                 <div className="absolute top-full left-0 right-0 mt-3 glass-card border border-white/10 rounded-2xl shadow-2xl z-[60] max-h-56 overflow-y-auto p-2 grid grid-cols-1 gap-1 animate-in fade-in slide-in-from-top-4">
                    {categorySuggestions.filter(c => c.toLowerCase().includes(category.toLowerCase())).map((cat, i) => (
                      <button 
                        key={i} 
                        type="button" 
                        onClick={() => { setCategory(cat); setShowCatDropdown(false); playClick(); }} 
                        className="text-left px-4 py-3 text-sm rounded-xl hover:bg-white/10 font-bold text-white transition-all flex items-center justify-between group"
                      >
                         {cat}
                         <Tag className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />
                      </button>
                    ))}
                    {categorySuggestions.filter(c => c.toLowerCase().includes(category.toLowerCase())).length === 0 && (
                      <div className="text-center py-6 text-[10px] text-slate-500 font-bold uppercase tracking-widest">Ketik untuk simpan "{category}"</div>
                    )}
                 </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Catatan</label>
              <input type="text" value={note} onChange={e => setNote(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-accent-blue text-white font-bold" placeholder="Opsional" />
            </div>

            <button type="submit" className="w-full fab-gradient text-white rounded-2xl py-5 font-black mt-4 hover:shadow-[0_10px_30px_-5px_rgba(168,85,247,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
              <Save className="w-6 h-6"/> Simpan Data
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {financeRecords.length > 0 && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {incomeData.length > 0 && (
                  <div className="glass-card rounded-[2rem] border border-white/5 p-8 shadow-xl">
                     <h3 className="font-black text-white mb-6 text-center text-sm uppercase tracking-widest">Pendapatan</h3>
                     <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={incomeData}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={85}
                              paddingAngle={4}
                              dataKey="value"
                              labelLine={false}
                              label={renderCustomizedLabel}
                            >
                              {incomeData.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS_INCOME[index % COLORS_INCOME.length]} stroke="rgba(255,255,255,0.05)" strokeWidth={2} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
                )}
                {expenseData.length > 0 && (
                  <div className="glass-card rounded-[2rem] border border-white/5 p-8 shadow-xl">
                     <h3 className="font-black text-white mb-6 text-center text-sm uppercase tracking-widest">Pengeluaran</h3>
                     <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={expenseData}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={85}
                              paddingAngle={4}
                              dataKey="value"
                              labelLine={false}
                              label={renderCustomizedLabel}
                            >
                              {expenseData.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS_EXPENSE[index % COLORS_EXPENSE.length]} stroke="rgba(255,255,255,0.05)" strokeWidth={2} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
                )}
             </div>
          )}

          <div className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl relative">
            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/2">
              <h3 className="font-black text-white text-lg">Riwayat Transaksi</h3>
              <span className="text-[10px] font-black bg-white/5 px-3 py-1 rounded-full text-slate-500 uppercase tracking-widest">{financeRecords.length} Entri</span>
            </div>
            {financeRecords.length === 0 ? (
              <div className="p-20 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">Belum ada riwayat transaksi.</div>
            ) : (
              <ul className="divide-y divide-white/5">
                {[...financeRecords].reverse().map(record => (
                  <li key={record.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-all group">
                    <div className="flex items-center gap-5 min-w-0">
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all shadow-lg", record.type === 'income' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20")}>
                        {record.type === 'income' ? <Plus className="w-6 h-6"/> : <Minus className="w-6 h-6"/>}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-white truncate text-base leading-none mb-1">{record.category}</p>
                        <p className="text-[10px] text-slate-500 truncate font-black uppercase tracking-widest">{record.note || format(record.createdAt, 'd MMMM yyyy', { locale: id })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right">
                         <span className={cn("font-black text-lg font-mono whitespace-nowrap block leading-none mb-1", record.type === 'income' ? "text-green-400" : "text-white")}>
                           {record.type === 'income' ? '+' : '-'}Rp {record.amount.toLocaleString('id-ID')}
                         </span>
                         <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">{format(record.createdAt, 'HH:mm')}</span>
                      </div>
                      <button onClick={() => { 
                         if(window.confirm("Hapus transaksi ini?")) { deleteFinanceRecord(record.id); playError(); } 
                      }} className="w-10 h-10 flex items-center justify-center text-slate-700 hover:text-red-500 transition-all rounded-xl hover:bg-red-500/10 shrink-0 border border-transparent hover:border-red-500/20">
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
    </div>
  );
}
