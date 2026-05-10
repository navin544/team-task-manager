import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  CheckCircle2,
  FolderKanban,
  Gauge,
  ListTodo,
  TimerReset
} from 'lucide-react';

import { CompletionTrendChart } from '../components/dashboard/CompletionTrendChart';
import { DistributionCharts } from '../components/dashboard/DistributionCharts';
import { MetricCard } from '../components/dashboard/MetricCard';
import { RecentActivityFeed } from '../components/dashboard/RecentActivityFeed';
import { Card } from '../components/common/Card';
import { PageHeader } from '../components/common/PageHeader';
import { Skeleton } from '../components/common/Skeleton';
import { getDashboardSummary } from '../services/dashboardService';

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardSummary
  });

  if (isLoading) {
    return (
      <div className="grid gap-5">
        <Skeleton className="h-24" />
        <div className="grid gap-5 xl:grid-cols-2">
          <Skeleton className="h-[360px]" />
          <Skeleton className="h-[360px]" />
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: 'Total projects',
      value: data.summary.totalProjects,
      helper: `${data.teamSize} contributors across the workspace`,
      icon: FolderKanban,
      accent: 'bg-brand'
    },
    {
      label: 'Total tasks',
      value: data.summary.totalTasks,
      helper: 'All visible work items in your scope',
      icon: ListTodo,
      accent: 'bg-sky-500'
    },
    {
      label: 'Completed',
      value: data.summary.completedTasks,
      helper: 'Finished work items',
      icon: CheckCircle2,
      accent: 'bg-success'
    },
    {
      label: 'Pending',
      value: data.summary.pendingTasks,
      helper: 'Todo and in-progress items',
      icon: TimerReset,
      accent: 'bg-warn'
    },
    {
      label: 'Overdue',
      value: data.summary.overdueTasks,
      helper: 'Requires attention',
      icon: AlertTriangle,
      accent: 'bg-danger'
    },
    {
      label: 'Productivity',
      value: `${data.summary.teamProductivity}%`,
      helper: 'Completion rate across visible tasks',
      icon: Gauge,
      accent: 'bg-accent'
    }
  ];

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Executive view"
        title="Delivery pulse"
        description="Track project throughput, balance deadlines, and spot blocked work before it becomes drag."
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.55fr,0.95fr]">
        <CompletionTrendChart data={data.charts.completionTrend} />
        <RecentActivityFeed activities={data.recentActivity} />
      </div>

      <DistributionCharts
        priorityBreakdown={data.charts.priorityBreakdown}
        statusBreakdown={data.charts.statusBreakdown}
      />

      <Card>
        <div className="mb-4">
          <h3 className="font-display text-xl font-bold text-ink">User Performance</h3>
          <p className="text-sm text-muted">Completion ratios for the most active assignees.</p>
        </div>
        <div className="grid gap-3">
          {data.userPerformance.map((member) => (
            <div
              key={member.userId}
              className="grid gap-3 rounded-[1.5rem] border border-line bg-white/40 p-4 dark:bg-slate-950/30 md:grid-cols-[1fr,180px]"
            >
              <div>
                <p className="font-semibold text-ink">{member.name}</p>
                <p className="text-sm text-muted">
                  {member.completed} completed of {member.total} assigned
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${member.completionRate}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-ink">{member.completionRate}%</span>
              </div>
            </div>
          ))}
          {!data.userPerformance.length ? <p className="text-sm text-muted">No assignee performance data yet.</p> : null}
        </div>
      </Card>
    </div>
  );
}
