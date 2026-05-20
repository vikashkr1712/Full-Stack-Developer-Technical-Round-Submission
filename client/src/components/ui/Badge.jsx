export default function Badge({ label, tone = 'default' }) {
  const styles = {
    default: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200',
    success: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-200',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
    danger: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[tone] || styles.default
      }`}
    >
      {label}
    </span>
  );
}
