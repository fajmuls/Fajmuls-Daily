import { format, addDays, startOfToday } from 'date-fns';
import { id } from 'date-fns/locale';
import { useAppContext } from '../store';
import { useAuth } from '../components/AuthWrapper';
import { Wallet, NotebookPen, Dumbbell, Trophy, Calendar, BarChart3, User, Grid, ChevronRight, Plus, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export function Dashboard() {
  const { notes, financeRecords } = useAppContext();
  const { profile } = useAuth();
  
  const today = startOfToday();
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i - 2));

  const totalBalance = financeRecords.reduce((acc, curr) => 
    curr.type === 'income' ? acc + curr.amount : acc - curr.amount, 0
  );

  const prevBalance = financeRecords
    .filter(r => r.createdAt < startOfToday().getTime())
    .reduce((acc, curr) => curr.type === 'income' ? acc + curr.amount : acc - curr.amount, 0);
  
  const balanceChange = prevBalance !== 0 
    ? ((totalBalance - prevBalance) / Math.abs(prevBalance) * 100).toFixed(0)
    : '100';

  const notesToday = notes.filter(n => n.createdAt >= startOfToday().getTime()).length;
  const workoutMins = notes
    .filter(n => n.type === 'workout')
    .reduce((acc, curr: any) => acc + (curr.durationMins || 0), 0);

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 max-w-4xl mx-auto pb-10"
    >
      {/* Greetings */}
      <motion.section variants={itemVariants} className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-white tracking-tight">
            Halo, {profile?.displayName?.split(' ')[0] || 'Fajmuls'}! 👋
          </h2>
          <p className="text-slate-500 font-medium">Semangat hari ini, tetap produktif!</p>
        </div>
        <div className="flex items-center gap-2">
           <button className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 hover:bg-white/10 transition-all text-slate-400 hover:text-white">
              <Calendar className="w-5 h-5" />
           </button>
        </div>
      </motion.section>

      {/* Horizontal Calendar */}
      <motion.section variants={itemVariants} className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-none px-1">
        {days.map((date, i) => {
          const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
          return (
            <div 
              key={i} 
              className={cn(
                "flex flex-col items-center min-w-[65px] py-4 rounded-[1.5rem] transition-all border",
                isToday 
                  ? "active-nav-bg text-white shadow-[0_8px_20px_-6px_rgba(59,130,246,0.5)] border-transparent" 
                  : "text-slate-500 border-white/5 bg-white/2 hover:bg-white/5"
              )}
            >
              <span className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">{format(date, 'EEE', { locale: id })}</span>
              <span className="text-xl font-black">{format(date, 'd')}</span>
            </div>
          );
        })}
      </motion.section>

      {/* Today's Summary Grid */}
      <motion.section variants={itemVariants} className="glass-card rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <BarChart3 className="w-32 h-32" />
        </div>
        <div className="flex items-center justify-between mb-8 relative z-10">
          <h3 className="font-black text-lg text-white">Ringkasan Hari Ini</h3>
          <Link to="/finance" className="text-[10px] font-black text-slate-500 flex items-center gap-2 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full border border-white/5 uppercase tracking-widest">
            Lihat Laporan <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          <SummaryCard 
            icon={Wallet} 
            label="Finance" 
            value={`Rp ${Math.abs(totalBalance).toLocaleString('id-ID')}`} 
            change={`${Number(balanceChange) >= 0 ? '+' : ''}${balanceChange}%`} 
            type="blue" 
          />
          <SummaryCard 
            icon={NotebookPen} 
            label="Journal" 
            value={`${notes.length}`} 
            change={`+${notesToday} Baru`} 
            type="purple" 
          />
          <SummaryCard 
            icon={Trophy} 
            label="Prayers" 
            value="Target" 
            change="5 Shalat" 
            type="yellow" 
          />
          <SummaryCard 
            icon={Dumbbell} 
            label="Workout" 
            value={`${workoutMins}m`} 
            change={`${workoutMins > 0 ? '+ Aktif' : 'Belum'}`} 
            type="green" 
          />
        </div>
      </motion.section>

      {/* Main Menu Grid */}
      <motion.section variants={itemVariants} className="space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="font-black text-lg text-white">Layanan & Menu</h3>
           <div className="h-px flex-1 bg-white/5 mx-6 hidden md:block" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <MenuCard icon={Wallet} label="Keuangan" desc="Arus kas & laporan" path="/finance" color="blue" />
          <MenuCard icon={NotebookPen} label="Catatan" desc="Jurnal & memo harian" path="/notes" color="purple" />
          <MenuCard icon={Trophy} label="Prayers" desc="Tracker qadha shalat" path="/notes/prayers" color="yellow" />
          <MenuCard icon={Dumbbell} label="Workout" desc="Log latihan fisik" path="/workout" color="green" />
          <MenuCard icon={User} label="Pribadi" desc="Arsip data rahasia" path="/notes/personal-list" color="blue" />
          <MenuCard icon={BarChart3} label="Statistik" desc="Analisa data berkala" path="/stats" color="purple" />
          <MenuCard icon={Calendar} label="Kalender" desc="Pengingat aktifitas" path="/calendar" color="yellow" />
          <MenuCard icon={Grid} label="Lainnya" desc="Menu tambahan" path="/others" color="slate" />
        </div>
      </motion.section>

      {/* Motivational Banner */}
      <motion.section variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-900 to-slate-950 p-10 border border-white/5 shadow-2xl group">
        <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-30 group-hover:scale-110 transition-transform duration-1000 ease-out pointer-events-none">
           <img src="https://fajmuls.github.io/Fajmuls-Daily/logo.png" className="w-full h-full object-contain translate-x-1/4 translate-y-1/4 rotate-12" alt="" />
        </div>
        <div className="relative z-10 max-w-sm">
          <h2 className="text-3xl font-black text-white mb-6 leading-tight tracking-tight">
            Konsistensi kecil membawa perubahan besar.
          </h2>
          <Link to="/notes" className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10">
            Tumbuh Sekarang <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="absolute bottom-0 right-10 flex items-end gap-1 pointer-events-none opacity-40">
           {[4, 8, 12, 16].map((h, i) => (
             <div key={i} className={`w-10 rounded-t-xl bg-white/10`} style={{ height: `${h*4}px` }} />
           ))}
           <div className="w-14 h-24 bg-accent-blue/30 rounded-t-xl flex items-center justify-center p-3 border-x border-t border-accent-blue/40">
              <Trophy className="text-yellow-400 w-full h-full drop-shadow-lg" />
           </div>
        </div>
      </motion.section>

      {/* Recent Activity */}
      <motion.section variants={itemVariants} className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-lg text-white">Transaksi Terakhir</h3>
          <Link to="/finance" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all">
            Semua Transaksi
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {financeRecords.length === 0 ? (
            <div className="p-12 text-center glass-card border border-white/5 rounded-[2rem] text-slate-500 font-bold uppercase tracking-widest text-[10px] md:col-span-2">
              Belum ada aktivitas.
            </div>
          ) : (
            [...financeRecords].reverse().slice(0, 4).map((record) => (
              <ActivityItem 
                key={record.id}
                icon={Wallet} 
                label={record.category} 
                desc={record.note || "Transaksi Harian"} 
                amount={`${record.type === 'income' ? '+ ' : '- '}Rp ${record.amount.toLocaleString('id-ID')}`} 
                time={format(record.createdAt, 'HH:mm')} 
                color={record.type === 'income' ? 'green' : 'blue'} 
              />
            ))
          )}
        </div>
      </motion.section>
    </motion.div>
  );
}

function SummaryCard({ icon: Icon, label, value, change, type }: any) {
  const colors: any = {
    blue: "text-blue-500 bg-blue-500/10",
    purple: "text-purple-500 bg-purple-500/10",
    green: "text-green-500 bg-green-500/10",
    yellow: "text-yellow-500 bg-yellow-500/10",
  };

  return (
    <div className="text-center group cursor-pointer">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110 shadow-lg", colors[type])}>
        <Icon className="w-7 h-7" />
      </div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-black text-white">{value}</p>
      <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-full mt-1 inline-block", type === 'green' || type === 'blue' ? 'text-green-400 bg-green-400/10' : 'text-blue-400 bg-blue-400/10')}>
        {change}
      </span>
    </div>
  );
}

function MenuCard({ icon: Icon, label, desc, path, color }: any) {
  const colors: any = {
    blue: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    purple: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    green: "text-green-400 bg-green-400/10 border-green-400/20",
    yellow: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    slate: "text-slate-400 bg-slate-400/10 border-slate-400/20",
  };

  return (
    <Link to={path} className="glass-card p-5 rounded-[2rem] flex flex-col items-center text-center transition-all hover:scale-[1.02] hover:bg-white/5 border border-white/5">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border transition-transform shadow-md", colors[color])}>
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="font-bold text-sm text-white mb-1">{label}</h4>
      <p className="text-[9px] text-slate-500 font-medium leading-relaxed px-2">{desc}</p>
    </Link>
  );
}

function ActivityItem({ icon: Icon, label, desc, amount, time, color }: any) {
  return (
    <div className="glass-card p-4 rounded-3xl flex items-center gap-4 group cursor-pointer hover:bg-white/5 transition-all mb-3">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner", color === 'green' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500')}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-sm text-white">{label}</h4>
        <p className="text-[10px] text-slate-500 font-medium">{desc}</p>
      </div>
      <div className="text-right">
        <p className={cn("font-black text-sm", color === 'green' ? 'text-green-400' : 'text-blue-400')}>{amount}</p>
        <p className="text-[9px] text-slate-500 font-bold">{time}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-slate-400 transition-colors" />
    </div>
  );
}
