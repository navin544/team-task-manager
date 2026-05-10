import { useDispatch, useSelector } from 'react-redux';

import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { PageHeader } from '../components/common/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { setTheme } from '../redux/slices/uiSlice';

export function SettingsPage() {
  const dispatch = useDispatch();
  const { logout, user } = useAuth();
  const theme = useSelector((state) => state.ui.theme);

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Workspace configuration"
        title="Settings"
        description="Tune visual preferences, review deployment assumptions, and manage your active session."
      />

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="grid gap-4">
          <div>
            <h3 className="font-display text-xl font-bold text-ink">Appearance</h3>
            <p className="text-sm text-muted">Choose the workspace mode that fits your environment.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => dispatch(setTheme('light'))}
              className={`rounded-[1.5rem] border p-5 text-left ${theme === 'light' ? 'border-brand bg-brand/10' : 'border-line bg-white/40 dark:bg-slate-950/30'}`}
            >
              <p className="font-semibold text-ink">Light mode</p>
              <p className="mt-2 text-sm text-muted">Warm surface tones for bright spaces.</p>
            </button>
            <button
              type="button"
              onClick={() => dispatch(setTheme('dark'))}
              className={`rounded-[1.5rem] border p-5 text-left ${theme === 'dark' ? 'border-brand bg-brand/10' : 'border-line bg-white/40 dark:bg-slate-950/30'}`}
            >
              <p className="font-semibold text-ink">Dark mode</p>
              <p className="mt-2 text-sm text-muted">High contrast focus for long work sessions.</p>
            </button>
          </div>
        </Card>

        <Card className="grid gap-4">
          <div>
            <h3 className="font-display text-xl font-bold text-ink">Session</h3>
            <p className="text-sm text-muted">Active session is scoped to refresh-token authentication.</p>
          </div>
          <div className="rounded-[1.5rem] border border-line bg-white/40 p-4 text-sm dark:bg-slate-950/30">
            <p className="text-muted">Signed in as</p>
            <p className="mt-2 font-semibold text-ink">{user?.name}</p>
            <p className="text-muted">{user?.email}</p>
          </div>
          <Button variant="secondary" className="justify-start" onClick={logout}>
            Logout current session
          </Button>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card>
          <h3 className="font-display text-xl font-bold text-ink">Frontend deploy</h3>
          <p className="mt-3 text-sm text-muted">Designed for Vercel or Netlify static deployment.</p>
          <code className="mt-4 block rounded-2xl bg-slate-950/90 px-4 py-3 text-sm text-slate-100">
            npm run build
          </code>
        </Card>
        <Card>
          <h3 className="font-display text-xl font-bold text-ink">Backend deploy</h3>
          <p className="mt-3 text-sm text-muted">Target Render or Railway with a managed MongoDB connection string.</p>
          <code className="mt-4 block rounded-2xl bg-slate-950/90 px-4 py-3 text-sm text-slate-100">
            npm start
          </code>
        </Card>
        <Card>
          <h3 className="font-display text-xl font-bold text-ink">Database</h3>
          <p className="mt-3 text-sm text-muted">Configured for MongoDB locally via Docker and MongoDB Atlas in production.</p>
          <code className="mt-4 block rounded-2xl bg-slate-950/90 px-4 py-3 text-sm text-slate-100">
            mongodb+srv://...
          </code>
        </Card>
      </div>
    </div>
  );
}
