import { motion } from 'framer-motion';

export function AuthLayout({ title, subtitle, children, sideNote }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(234,88,12,0.16),transparent_24%)]" />
      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-line bg-white/30 shadow-ambient backdrop-blur-xl dark:bg-slate-950/20 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="hidden min-h-[680px] flex-col justify-between bg-slate-950/85 p-10 text-slate-50 lg:flex">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm text-slate-200">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              Team Task Manager
            </div>
            <h1 className="max-w-md text-5xl font-bold leading-tight">
              Architected for calm execution across fast-moving teams.
            </h1>
            <p className="max-w-lg text-base text-slate-300">
              Secure projects, assignable tasks, team analytics, realtime updates, and a dashboard
              that surfaces momentum instead of noise.
            </p>
          </div>
          <div className="grid gap-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Why teams choose it</p>
            <div className="grid gap-3 text-sm text-slate-200">
              <p>JWT + refresh-token authentication with protected sessions.</p>
              <p>Portfolio-grade analytics, kanban workflows, and member permissions.</p>
              <p>Production-ready deployment and Docker support from day one.</p>
            </div>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex min-h-[680px] items-center justify-center px-6 py-10 sm:px-10"
        >
          <div className="w-full max-w-md space-y-8">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
                Team Task Manager
              </p>
              <h2 className="text-4xl font-bold text-ink">{title}</h2>
              <p className="text-sm text-muted">{subtitle}</p>
            </div>
            {children}
            {sideNote ? <div className="text-sm text-muted">{sideNote}</div> : null}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
