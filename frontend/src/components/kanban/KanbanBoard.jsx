import { motion } from 'framer-motion';

import { Card } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { formatDate, isTaskLate } from '../../utils/formatters';

const columns = [
  { id: 'TODO', label: 'Todo' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'COMPLETED', label: 'Completed' },
  { id: 'OVERDUE', label: 'Overdue' }
];

export function KanbanBoard({ onSelectTask, onStatusChange, tasks = [] }) {
  const tasksByStatus = columns.reduce((accumulator, column) => {
    accumulator[column.id] = tasks.filter((task) => task.status === column.id);
    return accumulator;
  }, {});

  return (
    <div className="grid gap-4 xl:grid-cols-4">
      {columns.map((column) => (
        <Card
          key={column.id}
          className="min-h-[520px] bg-white/55 p-4 dark:bg-slate-950/30"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const taskId = event.dataTransfer.getData('taskId');
            onStatusChange(taskId, column.id);
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-ink">{column.label}</h3>
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-muted dark:bg-slate-900/70">
              {tasksByStatus[column.id].length}
            </span>
          </div>
          <div className="grid gap-3">
            {tasksByStatus[column.id].map((task) => (
              <motion.button
                key={task.id}
                layout
                draggable
                type="button"
                onClick={() => onSelectTask(task)}
                onDragStart={(event) => {
                  event.dataTransfer.setData('taskId', task.id);
                }}
                className="w-full rounded-[1.5rem] border border-line bg-white/80 p-4 text-left shadow-sm transition hover:-translate-y-0.5 dark:bg-slate-900/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-semibold text-ink">{task.title}</h4>
                  <StatusBadge value={task.priority} type="priority" />
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-muted">{task.description || 'No description provided.'}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted">
                  <span>{task.assignee?.name || 'Unassigned'}</span>
                  <span className={isTaskLate(task) ? 'text-danger' : ''}>{formatDate(task.dueDate, 'No due date')}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
