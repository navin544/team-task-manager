import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card } from '../common/Card';

export function CompletionTrendChart({ data = [] }) {
  return (
    <Card className="h-[360px]">
      <div className="mb-4">
        <h3 className="font-display text-xl font-bold text-ink">Task Completion Trend</h3>
        <p className="text-sm text-muted">Daily completed work across the past week.</p>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="completionGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#0f766e" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#0f766e" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="completed"
            stroke="#0f766e"
            strokeWidth={3}
            fill="url(#completionGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
