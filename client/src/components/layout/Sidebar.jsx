import { NavLink } from 'react-router-dom';
import { toast } from 'sonner';
import {
  BarChart3,
  CalendarCheck,
  LayoutDashboard,
  Settings,
  Stethoscope,
  Users
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Patients', icon: Users, to: '/patients' },
  { label: 'Appointments', icon: CalendarCheck, to: '/appointments' },
  { label: 'Doctors', icon: Stethoscope, to: '/doctors' },
  { label: 'Reports', icon: BarChart3, to: '/dashboard' },
  { label: 'Settings', icon: Settings, to: '/dashboard' }
];

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={`no-print sticky top-0 hidden h-screen flex-col gap-6 border-r border-slate-200 bg-white/80 px-4 py-6 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/60 lg:flex ${
        collapsed ? 'w-24' : 'w-72'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-600 text-white shadow-soft">
            <Stethoscope size={20} />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-semibold text-slate-500">Healthcare Suite</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">Patient Hub</p>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
          aria-label="Toggle sidebar"
        >
          <span className="text-lg">{collapsed ? '>' : '<'}</span>
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${
                isActive
                  ? 'bg-brand-600 text-white shadow-soft'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
              }`
            }
          >
            <Icon size={18} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-brand-50 to-teal-50 p-4 text-sm text-slate-600 shadow-soft dark:border-slate-800 dark:from-slate-900 dark:to-slate-900 dark:text-slate-300">
          <p className="font-semibold text-slate-900 dark:text-white">Need a report?</p>
          <p className="mt-1 text-xs leading-relaxed">
            Generate clinical summaries and patient analytics in one click.
          </p>
          <button
            onClick={() => toast.info('Insights export will be available in the Reports module.')}
            className="mt-3 w-full rounded-xl bg-brand-600 py-2 text-xs font-semibold text-white"
          >
            Export Insights
          </button>
        </div>
      )}
    </aside>
  );
}
