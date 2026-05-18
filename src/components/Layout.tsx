import { ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wallet, NotebookPen, Bell, Plus, LogOut, User as UserIcon, Settings, Calendar, BarChart3, Grid } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';
import { useAuth } from './AuthWrapper';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const navItems = [
  { icon: LayoutDashboard, label: 'Beranda', path: '/' },
  { icon: Wallet, label: 'Keuangan', path: '/finance' },
  { icon: NotebookPen, label: 'Catatan', path: '/notes' },
  { icon: UserIcon, label: 'Profil', path: '/profile' },
];

const LOGO_URL = "/Fajmuls-Daily/logo.png";

export function Layout({ children }: { children: ReactNode }) {
  const { playClick } = useAudio();
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const UserAvatar = ({ className = "w-10 h-10" }) => (
    <div className={cn("relative group cursor-pointer", className)}>
      {(profile?.photoURL || user?.photoURL) ? (
        <img 
          src={profile?.photoURL || user?.photoURL} 
          alt="Profile" 
          className="w-full h-full rounded-full border border-white/10 object-cover shadow-lg" 
        />
      ) : (
        <div className="w-full h-full bg-accent-blue/20 flex items-center justify-center rounded-full text-accent-blue border border-accent-blue/30">
           <UserIcon className="w-1/2 h-1/2" />
        </div>
      )}
      <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 transition-colors" />
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-dashboard-bg font-sans text-slate-200 overflow-hidden">
      {/* Sidebar for Desktop (matching the app's aesthetic) */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-white/5 bg-dashboard-bg/50 backdrop-blur-xl">
        <div className="p-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner overflow-hidden">
             <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain" onError={(e) => e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/1055/1055644.png'} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white leading-none">Fajmuls</h1>
            <span className="text-[10px] font-bold text-accent-blue uppercase tracking-widest">Daily App</span>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-2 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={playClick}
              className={({ isActive }) => cn(
                "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-semibold group",
                isActive 
                  ? "active-nav-bg text-white shadow-[0_8px_20px_-6px_rgba(59,130,246,0.5)]" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110")} />
              {item.label}
            </NavLink>
          ))}
          
          <div className="pt-6 mt-6 border-t border-white/5 space-y-2">
            <p className="px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Layanan</p>
            {[
              { icon: Calendar, label: 'Kalender', path: '/calendar' },
              { icon: BarChart3, label: 'Statistik', path: '/stats' },
              { icon: Grid, label: 'Lainnya', path: '/others' },
              { icon: Settings, label: 'Pengaturan', path: '/settings' },
            ].map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex items-center gap-4 px-5 py-3 rounded-xl transition-all text-slate-400 hover:text-white hover:bg-white/5 font-medium"
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="p-8">
           <button 
             onClick={() => setShowLogoutConfirm(true)}
             className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold bg-white/5 text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all border border-white/5"
           >
             <LogOut className="w-5 h-5" />
             Keluar Akun
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Universal Header (Mobile & Desktop) */}
        <header className="flex items-center justify-between p-6 lg:px-10">
          <div className="lg:hidden flex items-center gap-3">
             <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 overflow-hidden">
                <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain" onError={(e) => e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/1055/1055644.png'} />
             </div>
             <div>
                <h1 className="text-lg font-black text-white leading-none">Fajmuls</h1>
                <p className="text-[8px] text-accent-blue font-bold uppercase tracking-widest">Daily</p>
             </div>
          </div>
          
          <div className="flex-1 hidden lg:block" />

          <div className="flex items-center gap-3">
            <button 
              onClick={() => { playClick(); alert("Notifikasi belum tersedia."); }}
              className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-dashboard-bg" />
            </button>
            <div onClick={() => navigate('/profile')}>
               <UserAvatar className="w-10 h-10 lg:ml-2" />
            </div>
            <div className="hidden lg:block text-left cursor-pointer" onClick={() => navigate('/profile')}>
               <p className="text-xs font-bold text-white leading-none mb-1">{firstName(profile?.displayName)}</p>
               <p className="text-[10px] text-slate-500 font-medium">Premium Member</p>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto w-full px-6 lg:px-10 pb-32 lg:pb-10">
          {children}
        </div>

        {/* Mobile Bottom Navigation (Image accurate) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pt-2 bg-gradient-to-t from-dashboard-bg via-dashboard-bg to-transparent">
          <nav className="glass-card flex items-center justify-between px-4 py-2 rounded-[2.5rem]">
            {navItems.slice(0, 2).map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={playClick}
                className={({ isActive }) => cn(
                  "flex flex-col items-center gap-1 p-3 rounded-2xl transition-all flex-1",
                  isActive ? "text-accent-blue" : "text-slate-500"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
              </NavLink>
            ))}

            {/* Floating FAB */}
            <div className="relative -top-8 px-4">
               <button 
                 onClick={() => navigate('/notes/normal')}
                 className="w-16 h-16 fab-gradient rounded-full flex items-center justify-center shadow-[0_10px_25px_-5px_rgba(168,85,247,0.5)] border-4 border-dashboard-bg text-white active:scale-95 transition-transform"
               >
                 <Plus className="w-8 h-8 stroke-[3]" />
               </button>
            </div>

            {navItems.slice(2, 4).map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={playClick}
                className={({ isActive }) => cn(
                  "flex flex-col items-center gap-1 p-3 rounded-2xl transition-all flex-1",
                  isActive ? "text-accent-blue" : "text-slate-500"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </main>

      {/* Logout Dialog */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-8 rounded-3xl max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
                 <LogOut className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Konfirmasi Keluar</h3>
              <p className="text-slate-400 text-sm mb-8">Apakah Anda yakin ingin keluar dari akun Anda?</p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all"
                >
                  Batal
                </button>
                <button 
                  onClick={() => {
                    logout();
                    setShowLogoutConfirm(false);
                  }}
                  className="py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all shadow-lg"
                >
                  Ya, Keluar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function firstName(name?: string | null) {
  if (!name) return 'User';
  return name.split(' ')[0];
}
