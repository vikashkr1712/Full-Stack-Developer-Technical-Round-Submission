import { Bell, LogOut, Menu, Moon, Search, Sun, UserCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ onToggle }) {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="no-print sticky top-0 z-30 flex min-h-[5.8rem] items-center justify-between gap-3 border-b border-[#dfe6f2] bg-white/80 px-5 py-4 backdrop-blur-xl sm:px-6 lg:px-6 xl:px-9">
      <div className="flex min-w-0 items-center gap-4">
        <button
          onClick={onToggle}
          className="pm-icon-button h-12 w-12 shrink-0 rounded-xl lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
        <div className="min-w-0">
          <p className="pm-topbar-eyebrow text-[0.75rem] font-extrabold uppercase tracking-[0.24em] text-[#77849d]">Healthcare Admin</p>
          <h1 className="pm-topbar-title truncate text-[1.05rem] font-extrabold text-[#081126] sm:text-xl">Patient Management Dashboard</h1>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">
        <label className="pm-field hidden h-11 max-w-[15rem] items-center gap-3 px-4 text-sm text-[#5d6b86] xl:flex xl:max-w-[20rem]">
          <Search size={18} />
          <input
            className="min-w-0 flex-1 bg-transparent text-sm text-[#34425f] outline-none placeholder:text-[#7c89a2]"
            placeholder="Search records"
          />
        </label>
        <button className="pm-icon-button h-11 w-11 sm:h-12 sm:w-12">
          <Bell size={18} />
        </button>
        <button
          onClick={toggleTheme}
          className="pm-icon-button h-11 w-11 sm:h-12 sm:w-12"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="pm-profile-button h-11 min-w-11 gap-2 px-3 sm:h-12 sm:min-w-[6.5rem]">
          <UserCircle2 size={18} />
          <span className="hidden text-sm font-extrabold sm:inline">Admin</span>
        </button>
        <button
          onClick={handleLogout}
          className="hidden h-12 items-center gap-2 rounded-full border border-red-200 bg-white/80 px-5 text-sm font-extrabold text-red-600 shadow-sm hover:bg-red-50 sm:flex"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
