import { Link } from 'react-router-dom';

import { Button } from '../components/common/Button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="surface-panel max-w-xl rounded-[2rem] p-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">404</p>
        <h1 className="mt-4 font-display text-5xl font-bold text-ink">This route fell off the sprint board.</h1>
        <p className="mt-4 text-sm text-muted">
          The page you requested does not exist or is outside the current route map.
        </p>
        <Link to="/dashboard" className="mt-8 inline-flex">
          <Button>Return to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
