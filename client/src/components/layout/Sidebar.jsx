import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  BarChart3,
  CalendarCheck,
  ChevronLeft,
  LogOut,
  LayoutDashboard,
  Settings,
  Stethoscope,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Patients', icon: Users, to: '/patients' },
  { label: 'Appointments', icon: CalendarCheck, to: '/appointments' },
  { label: 'Doctors', icon: Stethoscope, to: '/doctors' },
  { label: 'Reports', icon: BarChart3, to: '/reports' }
];

export const sideItems = [...navItems, { label: 'Settings', icon: Settings, to: '/settings' }];

export default function Sidebar({ open, onToggle }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`no-print fixed left-0 top-0 z-50 flex h-dvh w-[82vw] max-w-[20rem] flex-col overflow-y-auto border-r border-[#dfe6f2] bg-white/95 px-4 py-7 shadow-2xl backdrop-blur-xl transition-transform duration-300 lg:sticky lg:w-[18.5rem] lg:max-w-none lg:translate-x-0 lg:shadow-none ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#2f55e7] text-white shadow-soft">
            <Stethoscope size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[0.8rem] font-semibold leading-tight text-[#5d6b86]">Healthcare Suite</p>
            <p className="text-lg font-extrabold leading-tight text-[#081126]">Patient Hub</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="pm-icon-button h-10 w-10 shrink-0"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      <nav className="mt-10 flex flex-1 flex-col gap-3">
        {sideItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={label}
            to={to}
            onClick={() => {
              if (window.innerWidth < 1024) {
                onToggle();
              }
            }}
            className={({ isActive }) =>
              `flex items-center gap-4 rounded-xl px-4 py-3.5 text-[0.95rem] font-bold transition ${
                isActive
                  ? 'bg-[#2f55e7] text-white shadow-[0_12px_24px_rgba(47,85,231,0.28)]'
                  : 'text-[#34425f] hover:bg-[#f3f6ff]'
              }`
            }
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="pm-report-card hidden rounded-xl border border-[#dfe6f2] bg-[#f6f9ff] p-5 text-sm text-[#43516f] shadow-soft sm:block">
        <p className="font-extrabold text-[#081126]">Need a report?</p>
        <p className="mt-2 text-[0.82rem] leading-relaxed">
          Generate clinical summaries and patient analytics in one click.
        </p>
        <button
          onClick={() => toast.info('Insights export will be available in the Reports module.')}
          className="pm-blue-button mt-4 h-10 w-full text-sm"
        >
          Export Insights
        </button>
        <div className="pm-report-chart mt-5 h-24 overflow-hidden rounded-lg bg-[linear-gradient(to_top,rgba(47,85,231,0.12)_0_45%,transparent_45%),linear-gradient(135deg,transparent_0_70%,rgba(47,85,231,0.18)_70%)]">
          <svg viewBox="0 0 220 92" className="h-full w-full" aria-hidden="true">
            <path d="M12 74 L52 58 L82 42 L113 51 L146 31 L176 18 L206 6" fill="none" stroke="#2f55e7" strokeWidth="3" />
            {[12, 52, 82, 113, 146, 176, 206].map((x, i) => (
              <circle key={x} cx={x} cy={[74, 58, 42, 51, 31, 18, 6][i]} r="4" className="pm-report-dot" fill="#fff" stroke="#2f55e7" strokeWidth="3" />
            ))}
          </svg>
        </div>
      </div>

      <button onClick={handleLogout} className="mt-4 flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold text-red-600 transition hover:bg-red-50 lg:hidden">
        <LogOut size={20} />
        Logout
      </button>
    </aside>
  );
}
