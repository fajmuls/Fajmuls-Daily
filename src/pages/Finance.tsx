import { useState, FormEvent, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useAppContext } from '../store';
import { FinanceRecord } from '../types';
import { Plus, Minus, Trash2, ChevronDown, Tag } from 'lucide-react';
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
    return Object.entries(data).map(([name, value]) => ({ name, value, percent: total > 0 ? (value / total * 100).toFixed(1) : 0 })).sort((a,b) => b.value - a.value);
  }, [financeRecords]);

  const expenseData = useMemo(() => {
    const data: Record<string, number> = {};
    let total = 0;
    financeRecords.filter(r => r.type === 'expense').forEach(r => {
      data[r.category] = (data[r.category] || 0) + r.amount;
      total += r.amount;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value, percent: total > 0 ? (value / total * 100).toFixed(1) : 0 })).sort((a,b) => b.value - a.value);
  }, [financeRecords]);

  const COLORS_INCOME = ['#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534'];
  const COLORS_EXPENSE = ['#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // hide very small labels
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="bold">
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
          <p className="text-stone-400 text-xs mt-1">{data.percent}% dari total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 md:pb-0">
      <header>
        <h1 className="font-serif text-5xl font-bold text-stone-900">Catatan Keuangan</h1>
        <p className="text-stone-500 text-lg mt-2 font-medium">Lacak pemasukan dan pengeluaran harianmu.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-stone-900 text-white rounded-3xl p-8 shadow-xl">
            <p className="text-stone-400 uppercase tracking-widest text-xs font-bold mb-2">Total Saldo</p>
            <h2 className="text-4xl font-serif font-bold mb-6">Rp {balance.toLocaleString('id-ID')}</h2>
            
            <div className="grid grid-cols-2 gap-4 border-t border-stone-800 pt-6">
              <div>
                <p className="text-stone-500 text-xs uppercase tracking-widest font-bold mb-1 border-b border-green-500/30 pb-1">Pendapatan</p>
                <p className="text-green-400 font-bold font-mono">Rp {totalIncome.toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="text-stone-500 text-xs uppercase tracking-widest font-bold mb-1 border-b border-red-500/30 pb-1">Pengeluaran</p>
                <p className="text-red-400 font-bold font-mono">Rp {totalExpense.toLocaleString('id-ID')}</p>
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
              <label className="block text-xs uppercase tracking-wide text-stone-500 font-bold mb-2">Kategori (Pilih atau Ketik)</label>
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
                 <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto overflow-x-hidden p-2 grid grid-cols-2 gap-1 animate-in fade-in slide-in-from-top-2">
                    {categorySuggestions.filter(c => c.toLowerCase().includes(category.toLowerCase())).map((cat, i) => (
                      <button 
                        key={i} 
                        type="button" 
                        onClick={() => { setCategory(cat); setShowCatDropdown(false); playClick(); }} 
                        className="text-left px-3 py-2 text-sm rounded-lg hover:bg-stone-100 font-medium truncate"
                      >
                         {cat}
                      </button>
                    ))}
                    {categorySuggestions.filter(c => c.toLowerCase().includes(category.toLowerCase())).length === 0 && (
                      <div className="col-span-2 text-center py-4 text-xs text-stone-400">Ketik untuk membuat baru "{category}"</div>
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
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {incomeData.length > 0 && (
                  <div className="bg-paper rounded-3xl border border-stone-200 p-6 shadow-sm">
                     <h3 className="font-bold text-stone-900 mb-4 text-center">Distribusi Pendapatan</h3>
                     <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={incomeData}
                              cx="50%"
                              cy="50%"
                              innerRadius={30}
                              outerRadius={80}
                              paddingAngle={2}
                              dataKey="value"
                              labelLine={false}
                              label={renderCustomizedLabel}
                            >
                              {incomeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS_INCOME[index % COLORS_INCOME.length]} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
                )}
                {expenseData.length > 0 && (
                  <div className="bg-paper rounded-3xl border border-stone-200 p-6 shadow-sm">
                     <h3 className="font-bold text-stone-900 mb-4 text-center">Distribusi Pengeluaran</h3>
                     <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={expenseData}
                              cx="50%"
                              cy="50%"
                              innerRadius={30}
                              outerRadius={80}
                              paddingAngle={2}
                              dataKey="value"
                              labelLine={false}
                              label={renderCustomizedLabel}
                            >
                              {expenseData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS_EXPENSE[index % COLORS_EXPENSE.length]} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
                )}
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
                  <li key={record.id} className="p-6 flex items-center justify-between hover:bg-stone-50 transition-colors group">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0", record.type === 'income' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600")}>
                        {record.type === 'income' ? <Plus className="w-5 h-5"/> : <Minus className="w-5 h-5"/>}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-stone-900 truncate">{record.category}</p>
                        <p className="text-sm text-stone-500 truncate">{record.note || format(record.createdAt, 'd MMM yyyy', { locale: id })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className={cn("font-bold text-sm md:text-lg font-mono whitespace-nowrap", record.type === 'income' ? "text-green-600" : "text-stone-900")}>
                        {record.type === 'income' ? '+' : '-'}Rp {record.amount.toLocaleString('id-ID')}
                      </span>
                      <button onClick={() => { 
                         if(window.confirm("Hapus transaksi ini?")) { deleteFinanceRecord(record.id); playError(); } 
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
    </div>
  );
}
