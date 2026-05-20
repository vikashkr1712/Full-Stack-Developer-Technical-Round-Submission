import { Bell, LogOut, Moon, Search, Sun, UserCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ collapsed, onToggle }) {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="no-print sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white/70 px-4 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/70 sm:px-6 lg:px-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 lg:hidden"
          aria-label="Toggle menu"
        >
          {collapsed ? '>' : '<'}
        </button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Healthcare Admin</p>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Patient Management Dashboard</h1>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3 sm:flex-none">
        <label className="relative hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-500 shadow-sm transition focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:focus-within:ring-brand-900/40 md:flex">
          <Search size={16} />
          <input
            className="w-44 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
            placeholder="Search records"
          />
        </label>
        <button className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 text-slate-600 shadow-sm transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900">
          <Bell size={18} />
        </button>
        <button
          onClick={toggleTheme}
          className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 text-slate-600 shadow-sm transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200">
          <UserCircle2 size={18} />
          <span className="hidden sm:inline">Admin</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-white/80 px-3 py-2 text-sm font-medium text-rose-600 shadow-sm hover:bg-rose-50 dark:border-rose-900/40 dark:bg-slate-900/70 dark:text-rose-300 dark:hover:bg-rose-900/30"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
