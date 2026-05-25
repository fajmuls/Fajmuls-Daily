import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useAppContext } from '../store';
import { ArrowRight, Wallet, NotebookPen, FileImage, ShieldAlert, X, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useLocalStorage } from '../hooks/useLocalStorage';

export function Dashboard() {
  const { notes, financeRecords, docs, specials, missedPrayers, loading, hideAmounts } = useAppContext();
  const [showGreeting, setShowGreeting] = useLocalStorage('fajmus-show-greeting', true);

  const todayDate = format(new Date(), 'EEEE, d MMMM yyyy', { locale: id });

  const totalFinance = financeRecords.reduce((acc, curr) => {
    return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
  }, 0);

  const noteCounts = {
    normal: notes.filter(n => n.type === 'normal').length,
    ig: notes.filter(n => n.type === 'ig').length,
    personal: notes.filter(n => n.type === 'personal').length,
    workout: notes.filter(n => n.type === 'workout').length,
    qadha: missedPrayers.length
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-stone-900 text-white rounded-2xl shadow-lg ring-4 ring-stone-100">
           <Wallet className="w-6 h-6" />
        </div>
        <div className="font-serif text-2xl font-black tracking-tight text-stone-900">Fajmuls<span className="text-stone-300">Daily</span></div>
      </div>

      {showGreeting && (
        <header className="space-y-2 relative group">
          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-stone-900">
            Selamat Siang.
          </h1>
          <p className="text-xl text-stone-500 font-medium tracking-wide">
            {todayDate}
          </p>
          <button 
             onClick={() => setShowGreeting(false)} 
             className="absolute top-0 right-0 p-2 text-stone-300 hover:text-stone-900 opacity-0 group-hover:opacity-100 transition-opacity"
             title="Sembunyikan Salam"
          >
             <X className="w-5 h-5" />
          </button>
        </header>
      )}
      
      {!showGreeting && (
         <button 
           onClick={() => setShowGreeting(true)}
           className="text-stone-400 text-xs font-bold uppercase tracking-widest hover:text-stone-900 transition-colors"
         >
           Tampilkan Salam +
         </button>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
        {/* Finance Snippet */}
        <div className="bg-paper p-8 rounded-[2.5rem] shadow-sm border border-stone-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] scale-150 rotate-12 transition-transform group-hover:rotate-0 pointer-events-none">
             <Wallet className="w-32 h-32" />
          </div>
          <div className="flex justify-between items-start mb-12 relative z-10">
            <div className="p-4 bg-stone-900 text-white rounded-2xl shadow-xl">
              <Wallet className="w-6 h-6" />
            </div>
            <Link to="/finance" className="p-3 bg-stone-100 hover:bg-stone-200 rounded-2xl transition-all shadow-sm">
              <ArrowRight className="w-5 h-5 text-stone-700" />
            </Link>
          </div>
          <div className="relative z-10">
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-black mb-2">Estimasi Saldo</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-stone-900">
              {hideAmounts ? "Rp •••••••" : `Rp ${totalFinance.toLocaleString('id-ID')}`}
            </h2>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <TrendingUp className="w-3 h-3" /> Aktif
              </div>
              <p className="text-stone-500 text-xs font-bold uppercase tracking-widest">{financeRecords.length} Catatan</p>
            </div>
          </div>
        </div>

        {/* Notes Snippet */}
        <div className="bg-paper p-6 rounded-3xl shadow-sm border border-stone-200">
          <div className="flex justify-between items-start mb-8">
            <div className="p-3 bg-stone-100 rounded-2xl">
              <NotebookPen className="w-6 h-6 text-stone-700" />
            </div>
            <Link to="/notes" className="p-2 hover:bg-stone-50 rounded-full transition-colors">
              <ArrowRight className="w-5 h-5 text-stone-400 hover:text-stone-900" />
            </Link>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm uppercase tracking-widest text-stone-400 font-bold mb-1">Status Catatan</p>
              <h2 className="text-4xl font-bold tracking-tight text-stone-900 flex items-baseline gap-2">
                {notes.length + missedPrayers.length} <span className="text-xl text-stone-400 font-normal">total</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 pt-2 border-t border-stone-100">
              <div className="flex flex-col bg-stone-50 p-2 rounded-xl">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">Biasa</span>
                <span className="text-lg font-bold text-stone-800">{noteCounts.normal}</span>
              </div>
              <div className="flex flex-col bg-stone-50 p-2 rounded-xl">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">Instagram</span>
                <span className="text-lg font-bold text-stone-800">{noteCounts.ig}</span>
              </div>
              <div className="flex flex-col bg-stone-50 p-2 rounded-xl">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">Pribadi</span>
                <span className="text-lg font-bold text-stone-800">{noteCounts.personal}</span>
              </div>
              <div className="flex flex-col bg-stone-50 p-2 rounded-xl">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">Olahraga</span>
                <span className="text-lg font-bold text-stone-800">{noteCounts.workout}</span>
              </div>
              <div className="flex flex-col col-span-2 pt-2 border-t border-stone-50">
                <span className="text-[10px] font-bold text-accent-orange uppercase tracking-tighter">Qadha Shalat (Belum Lunas)</span>
                <span className="text-xl font-bold text-stone-900">{noteCounts.qadha}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Docs Snippet */}
        <div className="bg-paper p-6 rounded-3xl shadow-sm border border-stone-200">
          <div className="flex justify-between items-start mb-12">
            <div className="p-3 bg-stone-100 rounded-2xl">
              <FileImage className="w-6 h-6 text-stone-700" />
            </div>
            <Link to="/docs" className="p-2 hover:bg-stone-50 rounded-full transition-colors">
              <ArrowRight className="w-5 h-5 text-stone-400 hover:text-stone-900" />
            </Link>
          </div>
          <div>
            <p className="text-sm uppercase tracking-widest text-stone-400 font-bold mb-2">Dokumentasi</p>
            <h2 className="text-4xl font-bold font-serif flex items-baseline gap-2">
              {docs.length} <span className="text-xl text-stone-400 font-sans font-normal">foto</span>
            </h2>
            <p className="text-stone-500 mt-2">Tersimpan di Cloud</p>
          </div>
        </div>

        {/* Special Snippet */}
        <div className="bg-paper p-6 rounded-3xl shadow-sm border border-stone-200">
          <div className="flex justify-between items-start mb-12">
            <div className="p-3 bg-red-50 text-red-500 rounded-2xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <Link to="/special" className="p-2 hover:bg-stone-50 rounded-full transition-colors">
              <ArrowRight className="w-5 h-5 text-stone-400 hover:text-stone-900" />
            </Link>
          </div>
          <div>
            <p className="text-sm uppercase tracking-widest text-stone-400 font-bold mb-2">Spesial</p>
            <h2 className="text-4xl font-bold font-serif flex items-baseline gap-2">
              {specials.length} <span className="text-xl text-stone-400 font-sans font-normal">item</span>
            </h2>
            <p className="text-stone-500 mt-2">Catatan sangat penting & rahasia</p>
          </div>
        </div>
      </section>
    </div>
  );
}
