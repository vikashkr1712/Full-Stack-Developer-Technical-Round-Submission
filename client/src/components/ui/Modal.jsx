import { motion } from 'framer-motion';

export default function Modal({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-glass dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}
