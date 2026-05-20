export default function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/70 ${className}`}
    >
      {children}
    </div>
  );
}
