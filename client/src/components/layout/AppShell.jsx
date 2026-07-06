import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { navItems } from './Sidebar';

export default function AppShell({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('pm-scroll-lock', drawerOpen);
    return () => document.body.classList.remove('pm-scroll-lock');
  }, [drawerOpen]);

  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#f8fafc] text-[#081126]">
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#081126]/40 backdrop-blur-[2px] lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}
      <div className="relative flex min-h-dvh max-w-full">
        <Sidebar open={drawerOpen} onToggle={() => setDrawerOpen((prev) => !prev)} />
        <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
          <Topbar onToggle={() => setDrawerOpen((prev) => !prev)} />
          <main className="pm-mobile-safe min-w-0 flex-1 px-5 pb-8 pt-6 sm:px-7 lg:px-7 xl:px-8">
            {children}
          </main>
        </div>
      </div>
      <nav className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-[#dfe6f2] bg-white/92 px-3 pb-[calc(0.65rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_30px_rgba(35,55,95,0.08)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-3xl grid-cols-5 gap-1">
          {navItems.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                `flex h-16 min-w-0 flex-col items-center justify-center gap-1 rounded-xl text-[0.72rem] font-semibold transition ${
                  isActive ? 'bg-[#eef2ff] text-[#2f55e7]' : 'text-[#34425f] hover:bg-[#f5f7fb]'
                }`
              }
            >
              <Icon size={23} />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
