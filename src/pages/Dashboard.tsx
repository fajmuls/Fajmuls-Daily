import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useAppContext } from '../store';
import { ArrowRight, Wallet, NotebookPen, FileImage, ShieldAlert, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useLocalStorage } from '../hooks/useLocalStorage';

export function Dashboard() {
  const { notes, financeRecords, docs, specials, missedPrayers, loading } = useAppContext();
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
        <div className="bg-paper p-6 rounded-3xl shadow-sm border border-stone-200">
          <div className="flex justify-between items-start mb-12">
            <div className="p-3 bg-stone-100 rounded-2xl">
              <Wallet className="w-6 h-6 text-stone-700" />
            </div>
            <Link to="/finance" className="p-2 hover:bg-stone-50 rounded-full transition-colors">
              <ArrowRight className="w-5 h-5 text-stone-400 hover:text-stone-900" />
            </Link>
          </div>
          <div>
            <p className="text-sm uppercase tracking-widest text-stone-400 font-bold mb-2">Saldo Bersih</p>
            <h2 className="text-4xl font-bold font-serif">
              Rp {totalFinance.toLocaleString('id-ID')}
            </h2>
            <p className="text-stone-500 mt-2">{financeRecords.length} catatan bulan ini</p>
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
              <h2 className="text-4xl font-bold font-serif flex items-baseline gap-2">
                {notes.length + missedPrayers.length} <span className="text-xl text-stone-400 font-sans font-normal">total</span>
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
