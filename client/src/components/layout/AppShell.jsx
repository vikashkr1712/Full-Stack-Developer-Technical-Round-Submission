import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppShell({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex min-h-screen">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />
          <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
