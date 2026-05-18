import { useState, FormEvent, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useAppContext } from '../store';
import { FinanceRecord } from '../types';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAudio } from '../hooks/useAudio';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function Finance() {
  const { financeRecords, addFinanceRecord, deleteFinanceRecord } = useAppContext();
  const { playSuccess, playError } = useAudio();
  
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');

  const categorySuggestions = useMemo(() => {
    const categories = new Set<string>();
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
    financeRecords.filter(r => r.type === 'income').forEach(r => {
      data[r.category] = (data[r.category] || 0) + r.amount;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [financeRecords]);

  const expenseData = useMemo(() => {
    const data: Record<string, number> = {};
    financeRecords.filter(r => r.type === 'expense').forEach(r => {
      data[r.category] = (data[r.category] || 0) + r.amount;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [financeRecords]);

  const COLORS_INCOME = ['#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534'];
  const COLORS_EXPENSE = ['#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'];

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
                onClick={() => setType('expense')}
                className={cn("flex-1 py-2 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors", type === 'expense' ? "bg-red-100 text-red-700" : "bg-stone-100 text-stone-500")}
              >
                <Minus className="w-4 h-4" /> Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={cn("flex-1 py-2 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors", type === 'income' ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500")}
              >
                <Plus className="w-4 h-4" /> Pendapatan
              </button>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wide text-stone-500 font-bold mb-1">Jumlah</label>
              <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required className="w-full bg-stone-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-stone-900" placeholder="0" />
            </div>

            <div className="relative">
              <label className="block text-xs uppercase tracking-wide text-stone-500 font-bold mb-1">Kategori</label>
              <input 
                type="text" 
                value={category} 
                onChange={e => setCategory(e.target.value)} 
                required 
                className="w-full bg-stone-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-stone-900" 
                placeholder="Cth. Makanan"
                list="category-suggestions" 
              />
              <datalist id="category-suggestions">
                {categorySuggestions.map((cat, i) => (
                  <option key={i} value={cat} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wide text-stone-500 font-bold mb-1">Catatan Tambahan (Opsional)</label>
              <input type="text" value={note} onChange={e => setNote(e.target.value)} className="w-full bg-stone-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-stone-900" placeholder="Opsional" />
            </div>

            <button type="submit" className="w-full bg-stone-900 text-white rounded-xl py-4 font-bold mt-2 hover:bg-stone-850 active:scale-[0.98] transition-all">
              Simpan Data
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
                              innerRadius={40}
                              outerRadius={70}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {incomeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS_INCOME[index % COLORS_INCOME.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`} />
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
                              innerRadius={40}
                              outerRadius={70}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {expenseData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS_EXPENSE[index % COLORS_EXPENSE.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`} />
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
                    <div className="flex items-center gap-4">
                      <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0", record.type === 'income' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600")}>
                        {record.type === 'income' ? <Plus className="w-5 h-5"/> : <Minus className="w-5 h-5"/>}
                      </div>
                      <div>
                        <p className="font-bold text-stone-900 line-clamp-1">{record.category}</p>
                        <p className="text-sm text-stone-500 line-clamp-1">{record.note || format(record.createdAt, 'd MMM yyyy', { locale: id })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={cn("font-bold text-sm md:text-lg font-mono whitespace-nowrap", record.type === 'income' ? "text-green-600" : "text-stone-900")}>
                        {record.type === 'income' ? '+' : '-'}Rp {record.amount.toLocaleString('id-ID')}
                      </span>
                      <button onClick={() => { deleteFinanceRecord(record.id); playError(); }} className="p-2 text-stone-300 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 opacity-100 md:opacity-0 md:group-hover:opacity-100 shrink-0">
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
