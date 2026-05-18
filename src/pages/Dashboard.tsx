import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useAppContext } from '../store';
import { useAuth } from '../components/AuthWrapper';
import { Wallet, NotebookPen, FileImage, ShieldAlert, Plus, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export function Dashboard() {
  const { notes, financeRecords, docs, specials } = useAppContext();
  const { profile } = useAuth();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 5) setGreeting('Selamat Malam');
    else if (hour < 11) setGreeting('Selamat Pagi');
    else if (hour < 15) setGreeting('Selamat Siang');
    else if (hour < 19) setGreeting('Selamat Sore');
    else setGreeting('Selamat Malam');
  }, []);

  const todayDate = format(new Date(), 'EEEE, d MMMM yyyy', { locale: id });
  const totalFinance = financeRecords.reduce((acc, curr) => {
    return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
  }, 0);

  const firstName = profile?.displayName?.split(' ')[0] || '';

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 max-w-4xl mx-auto">
      {/* Editorial Header */}
      <header className="space-y-2 py-6">
        <div className="flex items-center gap-3 text-stone-400 font-bold uppercase tracking-[0.3em] text-[10px]">
          <span className="w-8 h-px bg-stone-200" />
          {todayDate}
        </div>
        <h1 className="font-serif text-7xl md:text-8xl font-bold tracking-tighter text-stone-900 leading-[0.85]">
          {greeting}<br/>
          {firstName && <span className="text-accent-orange">{firstName}.</span>}
        </h1>
      </header>

      {/* Main Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Finance - Ultra Simple but Detailed */}
        <div className="bg-stone-900 text-white p-10 rounded-[2.5rem] flex flex-col justify-between group h-80 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8">
            <Link to="/finance" className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-accent-orange transition-all group-hover:rotate-45">
              <ArrowUpRight className="w-6 h-6" />
            </Link>
          </div>
          <div>
            <Wallet className="w-10 h-10 text-accent-gold mb-6" />
            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-white/40 mb-2">Balance</p>
            <h2 className="text-5xl font-serif font-bold tracking-tight">
              Rp {totalFinance.toLocaleString('id-ID')}
            </h2>
          </div>
          <div className="flex gap-8 border-t border-white/10 pt-6">
            <div>
              <span className="block text-[9px] uppercase font-bold text-white/30 tracking-widest mb-1">Entri</span>
              <span className="text-lg font-bold">{financeRecords.length}</span>
            </div>
            <div>
              <span className="block text-[9px] uppercase font-bold text-white/30 tracking-widest mb-1">Status</span>
              <span className="text-lg font-bold text-accent-green">Aktif</span>
            </div>
          </div>
        </div>

        {/* Notes - Striking Gold */}
        <div className="bg-accent-gold p-10 rounded-[2.5rem] flex flex-col justify-between h-80 group">
          <div className="flex justify-between items-start">
            <NotebookPen className="w-10 h-10 text-trip-brown" />
            <Link to="/notes" className="w-12 h-12 bg-trip-brown text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
              <Plus className="w-6 h-6" />
            </Link>
          </div>
          <div>
            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-trip-brown/40 mb-2">Total Journal</p>
            <h2 className="text-7xl font-serif font-bold text-trip-brown">
              {notes.length}
            </h2>
          </div>
          <p className="text-trip-brown/60 text-sm font-bold tracking-tight">Aktifitas & Catatan Harian</p>
        </div>

        {/* Small Cards */}
        <div className="grid grid-cols-2 gap-8 md:col-span-2">
           <Link to="/docs" className="bg-white border border-stone-200 p-8 rounded-[2rem] flex flex-col justify-between hover:shadow-xl transition-all group h-64">
              <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center group-hover:bg-stone-900 group-hover:text-white transition-colors">
                <FileImage className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold tracking-widest text-stone-400 mb-1">Documents</p>
                <h3 className="text-3xl font-bold text-stone-900">{docs.length} <span className="text-stone-300">Arsip</span></h3>
              </div>
           </Link>

           <Link to="/special" className="bg-stone-50 border border-stone-200 p-8 rounded-[2rem] flex flex-col justify-between hover:bg-stone-900 hover:text-white transition-all group h-64 overflow-hidden relative">
              <ShieldAlert className="absolute -right-4 -bottom-4 w-32 h-32 opacity-5 group-hover:opacity-20 transition-opacity" />
              <div className="w-12 h-12 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold tracking-widest text-red-300 group-hover:text-red-400 mb-1">Exclusive</p>
                <h3 className="text-3xl font-bold">{specials.length} Vault</h3>
              </div>
           </Link>
        </div>
      </section>
    </div>
  );
}
