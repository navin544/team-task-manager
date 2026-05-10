import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import { Card } from '../common/Card';

const pieColors = ['#0f766e', '#fb923c', '#ef4444', '#64748b'];

export function DistributionCharts({ priorityBreakdown = {}, statusBreakdown = {} }) {
  const statusData = Object.entries(statusBreakdown).map(([name, value]) => ({ name, value }));
  const priorityData = Object.entries(priorityBreakdown).map(([name, value]) => ({ name, value }));

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Card className="h-[340px]">
        <div className="mb-4">
          <h3 className="font-display text-xl font-bold text-ink">Status Distribution</h3>
          <p className="text-sm text-muted">Live visibility into task flow and bottlenecks.</p>
        </div>
        <ResponsiveContainer width="100%" height="80%">
          <PieChart>
            <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95}>
              {statusData.map((entry, index) => (
                <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card className="h-[340px]">
        <div className="mb-4">
          <h3 className="font-display text-xl font-bold text-ink">Priority Mix</h3>
          <p className="text-sm text-muted">How work is distributed across urgency levels.</p>
        </div>
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={priorityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="value" fill="#ea580c" radius={[12, 12, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
