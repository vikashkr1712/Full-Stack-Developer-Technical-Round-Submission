export default function Card({ children, className = '' }) {
  return (
    <div
      className={`pm-card p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900/80 ${className}`}
    >
      {children}
    </div>
  );
}
