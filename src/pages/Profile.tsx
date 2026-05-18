import { useAuth } from '../components/AuthWrapper';
import { User, Mail, Shield, LogOut, ChevronRight, Bell, Settings, Lock } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';
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

export function Profile() {
  const { profile } = useAuth();
  const { playClick, playError } = useAudio();

  const handleLogout = () => {
     playError();
     alert("Fitur logout belum diimplementasikan di versi preview ini.");
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-2xl mx-auto space-y-8 pb-10"
    >
      <motion.div variants={itemVariants} className="text-center space-y-4">
        <div className="relative inline-block group">
           <div className="w-32 h-32 rounded-[2.5rem] bg-white/5 border border-white/10 p-1 mb-2 group-hover:scale-105 transition-transform duration-500">
              <div className="w-full h-full rounded-[2.2rem] overflow-hidden bg-dashboard-bg/50 flex items-center justify-center border border-white/5 shadow-2xl relative">
                 {profile?.photoURL ? (
                    <img src={profile.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                    <User className="w-16 h-16 text-slate-700" />
                 )}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Edit Foto</span>
                 </div>
              </div>
           </div>
           <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-accent-purple rounded-2xl flex items-center justify-center border-4 border-dashboard-bg shadow-xl">
              <Shield className="w-5 h-5 text-white" />
           </div>
        </div>
        
        <div>
           <h1 className="text-3xl font-black text-white tracking-tight uppercase">{profile?.displayName || 'Fajmuls Member'}</h1>
           <p className="text-slate-500 font-bold tracking-widest text-[10px] uppercase mt-1 flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Premium Member
           </p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4">
         <ProfileItem icon={User} label="Informasi Personal" value={profile?.displayName || '-'} />
         <ProfileItem icon={Mail} label="Email Akun" value={profile?.email || '-'} />
         <ProfileItem icon={Lock} label="Keamanan" value="Password Terenkripsi" />
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-4">
         <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] pl-6">Pengaturan Aplikasi</h3>
         <div className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden">
            <SettingRow icon={Bell} label="Notifikasi Peringatan" />
            <SettingRow icon={Settings} label="Preferensi Tema" />
            <div 
               onClick={handleLogout}
               className="p-6 flex items-center justify-between hover:bg-white/5 cursor-pointer group transition-all"
            >
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20 group-hover:scale-110 transition-transform">
                     <LogOut className="w-6 h-6" />
                  </div>
                  <div>
                     <p className="font-black text-white text-sm">Keluar dari Sesi</p>
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Logout Akun Saya</p>
                  </div>
               </div>
               <ChevronRight className="w-5 h-5 text-slate-700" />
            </div>
         </div>
      </motion.div>
    </motion.div>
  );
}

function ProfileItem({ icon: Icon, label, value }: any) {
   return (
      <div className="glass-card p-6 rounded-[2rem] border border-white/5 flex items-center gap-6 group hover:bg-white/5 transition-all">
         <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 text-slate-400 group-hover:text-white transition-all">
            <Icon className="w-6 h-6" />
         </div>
         <div className="flex-1">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-base font-black text-white">{value}</p>
         </div>
         <ChevronRight className="w-5 h-5 text-slate-800" />
      </div>
   );
}

function SettingRow({ icon: Icon, label }: any) {
   return (
      <div className="p-6 flex items-center justify-between hover:bg-white/5 cursor-pointer border-b border-white/5 group transition-all last:border-0">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 text-slate-400 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
               <Icon className="w-6 h-6" />
            </div>
            <p className="font-black text-white text-sm">{label}</p>
         </div>
         <ChevronRight className="w-5 h-5 text-slate-700" />
      </div>
   );
}
