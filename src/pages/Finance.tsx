import { useState, FormEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { useAppContext } from '../store';
import { FinanceRecord } from '../types';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAudio } from '../hooks/useAudio';

export function Finance() {
  const { financeRecords, addFinanceRecord, deleteFinanceRecord } = useAppContext();
  const { playSuccess, playError } = useAudio();
  
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');

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

  const balance = financeRecords.reduce((acc, curr) => curr.type === 'income' ? acc + curr.amount : acc - curr.amount, 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header>
        <h1 className="font-serif text-5xl font-bold text-stone-900">Financial Records</h1>
        <p className="text-stone-500 text-lg mt-2 font-medium">Track your daily income and expenses.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-stone-900 text-white rounded-3xl p-8 shadow-xl">
            <p className="text-stone-400 uppercase tracking-widest text-xs font-bold mb-2">Total Balance</p>
            <h2 className="text-5xl font-serif font-bold">${balance.toFixed(2)}</h2>
          </div>

          <form onSubmit={handleSubmit} className="bg-paper rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-bold text-lg">Add Record</h3>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={cn("flex-1 py-2 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors", type === 'expense' ? "bg-red-100 text-red-700" : "bg-stone-100 text-stone-500")}
              >
                <Minus className="w-4 h-4" /> Expense
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={cn("flex-1 py-2 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors", type === 'income' ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500")}
              >
                <Plus className="w-4 h-4" /> Income
              </button>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wide text-stone-500 font-bold mb-1">Amount</label>
              <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required className="w-full bg-stone-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-stone-900" placeholder="0.00" />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wide text-stone-500 font-bold mb-1">Category</label>
              <input type="text" value={category} onChange={e => setCategory(e.target.value)} required className="w-full bg-stone-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-stone-900" placeholder="e.g. Groceries" />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wide text-stone-500 font-bold mb-1">Note (Optional)</label>
              <input type="text" value={note} onChange={e => setNote(e.target.value)} className="w-full bg-stone-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-stone-900" placeholder="e.g. Target run" />
            </div>

            <button type="submit" className="w-full bg-stone-900 text-white rounded-xl py-4 font-bold mt-2 hover:bg-stone-850 active:scale-[0.98] transition-all">
              Save Record
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-paper rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <h3 className="font-bold text-stone-900">Recent Transactions</h3>
            </div>
            {financeRecords.length === 0 ? (
              <div className="p-12 text-center text-stone-400">No records found. Start adding some!</div>
            ) : (
              <ul className="divide-y divide-stone-100">
                {financeRecords.map(record => (
                  <li key={record.id} className="p-6 flex items-center justify-between hover:bg-stone-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", record.type === 'income' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600")}>
                        {record.type === 'income' ? <Plus className="w-5 h-5"/> : <Minus className="w-5 h-5"/>}
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">{record.category}</p>
                        <p className="text-sm text-stone-500">{record.note || format(record.createdAt, 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className={cn("font-bold text-lg font-mono", record.type === 'income' ? "text-green-600" : "text-stone-900")}>
                        {record.type === 'income' ? '+' : '-'}${record.amount.toFixed(2)}
                      </span>
                      <button onClick={() => { deleteFinanceRecord(record.id); playError(); }} className="p-2 text-stone-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50">
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
