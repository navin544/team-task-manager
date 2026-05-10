import { motion } from 'framer-motion';

import { Card } from '../common/Card';

export function MetricCard({ accent, icon: Icon, label, value, helper }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="relative overflow-hidden">
        <div className={`absolute inset-x-0 top-0 h-1.5 ${accent}`} />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-2 font-display text-3xl font-bold text-ink">{value}</p>
            <p className="mt-2 text-sm text-muted">{helper}</p>
          </div>
          <div className="rounded-2xl bg-white/80 p-3 text-brand dark:bg-slate-900/70">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
