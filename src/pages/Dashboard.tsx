import { format, addDays, startOfToday } from 'date-fns';
import { id } from 'date-fns/locale';
import { useAppContext } from '../store';
import { useAuth } from '../components/AuthWrapper';
import { Wallet, NotebookPen, Dumbbell, Trophy, Calendar, BarChart3, User, Grid, ChevronRight, Plus, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export function Dashboard() {
  const { notes, financeRecords } = useAppContext();
  const { profile } = useAuth();
  
  const today = startOfToday();
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i - 2));

  const totalBalance = financeRecords.reduce((acc, curr) => 
    curr.type === 'income' ? acc + curr.amount : acc - curr.amount, 0
  );

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

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 max-w-4xl mx-auto"
    >
      {/* Greetings */}
      <motion.section variants={itemVariants} className="space-y-1">
        <h2 className="text-3xl font-black text-white tracking-tight">
          Halo, {profile?.displayName?.split(' ')[0] || 'Fajmuls'}! 👋
        </h2>
        <p className="text-slate-500 font-medium">Semangat hari ini, tetap produktif!</p>
      </motion.section>

      {/* Horizontal Calendar */}
      <motion.section variants={itemVariants} className="flex justify-between items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {days.map((date, i) => {
          const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
          return (
            <div 
              key={i} 
              className={cn(
                "flex flex-col items-center min-w-[60px] py-3 rounded-2xl transition-all",
                isToday ? "active-nav-bg text-white shadow-lg" : "text-slate-500"
              )}
            >
              <span className="text-[10px] font-bold uppercase mb-1">{format(date, 'EEE', { locale: id })}</span>
              <span className="text-lg font-black">{format(date, 'd')}</span>
            </div>
          );
        })}
      </motion.section>

      {/* Today's Summary Grid */}
      <motion.section variants={itemVariants} className="glass-card rounded-[2.5rem] p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg">Ringkasan Hari Ini</h3>
          <Link to="/reports" className="text-xs font-bold text-slate-500 flex items-center gap-1 hover:text-white transition-colors">
            Lihat Semua <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <SummaryCard 
            icon={Wallet} 
            label="Keuangan" 
            value={`Rp ${Math.abs(totalBalance).toLocaleString('id-ID')}`} 
            change="+12%" 
            type="blue" 
          />
          <SummaryCard 
            icon={NotebookPen} 
            label="Catatan" 
            value={`${notes.length} Catatan`} 
            change="+2" 
            type="purple" 
          />
          <SummaryCard 
            icon={Trophy} 
            label="Tugas" 
            value="5 Selesai" 
            change="+3" 
            type="yellow" 
          />
          <SummaryCard 
            icon={Dumbbell} 
            label="Workout" 
            value="45 Menit" 
            change="+10m" 
            type="green" 
          />
        </div>
      </motion.section>

      {/* Main Menu Grid */}
      <motion.section variants={itemVariants} className="space-y-4">
        <h3 className="font-bold text-lg">Menu Utama</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MenuCard icon={Wallet} label="Keuangan" desc="Catatan pemasukan dan pengeluaran" path="/finance" color="blue" />
          <MenuCard icon={NotebookPen} label="Catatan" desc="Buat dan kelola catatan pribadi" path="/notes" color="purple" />
          <MenuCard icon={Trophy} label="Tugas" desc="Kelola tugas harianmu" path="/tasks" color="yellow" />
          <MenuCard icon={Dumbbell} label="Workout" desc="Catat aktivitas workout" path="/workout" color="green" />
          <MenuCard icon={User} label="Data Pribadi" desc="Informasi dan data dirimu" path="/profile" color="blue" />
          <MenuCard icon={BarChart3} label="Statistik" desc="Lihat perkembangan dan laporan" path="/stats" color="purple" />
          <MenuCard icon={Calendar} label="Kalender" desc="Jadwal dan pengingat" path="/calendar" color="yellow" />
          <MenuCard icon={Grid} label="Lainnya" desc="Fitur lainnya di sini" path="/others" color="slate" />
        </div>
      </motion.section>

      {/* Motivational Banner */}
      <motion.section variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-900 to-indigo-950 p-8 lg:p-10 border border-white/10 shadow-xl group">
        <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-20 group-hover:scale-110 transition-transform duration-700">
           <img src="https://fajmuls.github.io/Fajmuls-Daily/logo.png" className="w-full h-full object-contain translate-x-1/4 translate-y-1/4 rotate-12" alt="" />
        </div>
        <div className="relative z-10 max-w-sm">
          <h2 className="text-2xl font-black text-white mb-4 leading-tight">
            Konsistensi kecil membawa perubahan besar.
          </h2>
          <p className="text-blue-300 font-bold flex items-center gap-2">
            Terus tumbuh, setiap hari. ✨
          </p>
        </div>
        {/* Abstract steps graphic (stylized) */}
        <div className="absolute bottom-0 right-10 flex items-end gap-1 pointer-events-none opacity-40">
           <div className="w-8 h-4 bg-white/20 rounded-t-lg" />
           <div className="w-8 h-8 bg-white/20 rounded-t-lg" />
           <div className="w-8 h-12 bg-white/20 rounded-t-lg" />
           <div className="w-8 h-16 bg-white/20 rounded-t-lg" />
           <div className="w-12 h-20 bg-white/20 rounded-t-lg flex items-center justify-center p-2">
              <Trophy className="text-yellow-400 w-full h-full" />
           </div>
        </div>
      </motion.section>

      {/* Recent Activity */}
      <motion.section variants={itemVariants} className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-white">Aktivitas Terbaru</h3>
          <Link to="/finance" className="text-xs font-bold text-slate-500 flex items-center gap-1 hover:text-white transition-colors">
            Lihat Semua <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-3">
          {financeRecords.length === 0 ? (
            <div className="p-8 text-center glass-card border border-white/5 rounded-3xl text-slate-500 font-medium">
              Belum ada transaksi terbaru.
            </div>
          ) : (
            financeRecords.slice(0, 3).map((record) => (
              <ActivityItem 
                key={record.id}
                icon={Wallet} 
                label={record.category} 
                desc={record.note || "Transaksi Keuangan"} 
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
    <div className="glass-card p-4 rounded-3xl flex items-center gap-4 group cursor-pointer hover:bg-white/5 transition-all">
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

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
