import { Bell, ChevronLeft, LogOut, Menu, Search, UserCircle2 } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { NAV_ITEMS } from '../utils/constants';
import { cn } from '../utils/cn';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { toggleSidebar } from '../redux/slices/uiSlice';

export function AppShell() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const location = useLocation();
  const { accessToken, user, logout } = useAuth();
  const { sidebarOpen, theme } = useSelector((state) => state.ui);

  const socketHandlers = useMemo(
    () => ({
      'notifications:new': () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['project'] });
      }
    }),
    [queryClient]
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useSocket({
    enabled: Boolean(accessToken),
    token: accessToken,
    handlers: socketHandlers
  });

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-4 px-3 py-3 sm:px-4 lg:gap-5 lg:px-6">
        <aside
          className={cn(
            'glass-panel fixed inset-y-3 left-3 z-30 flex w-[280px] flex-col rounded-[1.75rem] p-5 transition-transform duration-300 lg:static lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-[110%] lg:w-[92px]'
          )}
        >
          <div className="mb-8 flex items-center justify-between gap-3">
            <Link to="/dashboard" className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-white">
                TM
              </div>
              {sidebarOpen ? (
                <div>
                  <p className="font-display text-lg font-bold text-ink">Team Task</p>
                  <p className="text-xs text-muted">Manager</p>
                </div>
              ) : null}
            </Link>
            <button
              type="button"
              onClick={() => dispatch(toggleSidebar())}
              className="ring-focus inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-line text-muted"
            >
              <ChevronLeft className={cn('h-4 w-4 transition-transform', !sidebarOpen && 'rotate-180')} />
            </button>
          </div>

          <nav className="grid gap-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-colors',
                      isActive
                        ? 'bg-brand text-white shadow-lg shadow-brand/20'
                        : 'text-muted hover:bg-white/50 hover:text-ink dark:hover:bg-slate-900/40',
                      !sidebarOpen && 'justify-center'
                    )
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {sidebarOpen ? <span>{item.label}</span> : null}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-auto space-y-4">
            <div className="rounded-[1.5rem] border border-line bg-slate-950/90 p-4 text-slate-50">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Signed in as</p>
              <p className="mt-2 font-semibold">{user?.name}</p>
              <p className="text-sm text-slate-300">{user?.role}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="ring-focus flex w-full items-center justify-center gap-2 rounded-2xl border border-line px-4 py-3 text-sm font-semibold text-muted transition hover:bg-white/50 hover:text-ink dark:hover:bg-slate-900/40"
            >
              <LogOut className="h-4 w-4" />
              {sidebarOpen ? 'Logout' : null}
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4 lg:pl-0">
          <header className="glass-panel sticky top-3 z-20 flex items-center justify-between gap-4 rounded-[1.75rem] px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => dispatch(toggleSidebar())}
                className="ring-focus inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-line lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted">Workspace</p>
                <h1 className="font-display text-2xl font-bold text-ink">
                  {location.pathname === '/dashboard'
                    ? 'Command Center'
                    : location.pathname
                        .replace('/', '')
                        .replaceAll('-', ' ')
                        .replace(/\b\w/g, (letter) => letter.toUpperCase())}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-3 rounded-2xl border border-line bg-white/40 px-4 py-3 text-sm text-muted dark:bg-slate-900/40 md:flex">
                <Search className="h-4 w-4" />
                <span>Search tasks, people, projects</span>
              </div>
              <ThemeToggle />
              <Link
                to="/profile"
                className="ring-focus inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-line text-muted transition hover:text-ink"
                aria-label="Go to profile"
              >
                <UserCircle2 className="h-5 w-5" />
              </Link>
              <div className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-line text-muted">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-accent" />
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
