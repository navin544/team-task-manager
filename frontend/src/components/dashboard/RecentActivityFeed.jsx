import { Card } from '../common/Card';
import { formatRelativeTime } from '../../utils/formatters';

export function RecentActivityFeed({ activities = [] }) {
  return (
    <Card className="h-full">
      <div className="mb-4">
        <h3 className="font-display text-xl font-bold text-ink">Recent Activity</h3>
        <p className="text-sm text-muted">Updates across projects, tasks, comments, and members.</p>
      </div>
      <div className="grid gap-3">
        {activities.map((activity) => (
          <div key={activity.id} className="rounded-2xl border border-line bg-white/40 p-4 dark:bg-slate-950/30">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink">{activity.actor?.name || 'System'}</p>
                <p className="mt-1 text-sm text-muted">{activity.action.replaceAll('.', ' ')}</p>
              </div>
              <span className="text-xs text-muted">{formatRelativeTime(activity.createdAt)}</span>
            </div>
          </div>
        ))}
        {!activities.length ? <p className="text-sm text-muted">No recent activity yet.</p> : null}
      </div>
    </Card>
  );
}
