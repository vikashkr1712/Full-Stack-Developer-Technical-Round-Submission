import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, label, value, trend, gradient }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-2xl border border-white/40 bg-gradient-to-br ${gradient} p-5 shadow-soft`}
    >
      <div className="flex items-center justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/80 text-slate-800 shadow-soft">
          <Icon size={18} />
        </div>
        <span className="text-xs font-semibold text-emerald-600">{trend}</span>
      </div>
      <p className="mt-5 text-sm font-medium text-slate-600">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </motion.div>
  );
}
