import { motion } from 'framer-motion';
import { useEffect } from 'react';

export default function Modal({ open, onClose, children, className = '', showClose = true }) {
  useEffect(() => {
    document.body.classList.toggle('pm-scroll-lock', open);
    return () => document.body.classList.remove('pm-scroll-lock');
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center overflow-y-auto bg-slate-950/40 px-0 pt-8 backdrop-blur-sm sm:items-center sm:px-4 sm:py-10">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className={`w-full max-w-2xl rounded-t-[1.35rem] border border-slate-200 bg-white p-5 shadow-glass dark:border-slate-800 dark:bg-slate-900 sm:max-h-[92dvh] sm:overflow-y-auto sm:rounded-[1.35rem] sm:p-6 ${className}`}
      >
        {showClose && <div className="flex justify-end">
          <button
            onClick={onClose}
            className="pm-icon-button h-10 w-10 text-xs font-semibold text-slate-500"
            aria-label="Close"
          >
            x
          </button>
        </div>}
        {children}
      </motion.div>
    </div>
  );
}
