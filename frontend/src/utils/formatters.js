import { format, formatDistanceToNowStrict, isPast } from 'date-fns';

export function formatDate(value, fallback = 'No date') {
  if (!value) {
    return fallback;
  }

  return format(new Date(value), 'MMM d, yyyy');
}

export function formatDateTime(value) {
  if (!value) {
    return 'Unknown';
  }

  return format(new Date(value), 'MMM d, yyyy • h:mm a');
}

export function formatRelativeTime(value) {
  if (!value) {
    return 'Just now';
  }

  return `${formatDistanceToNowStrict(new Date(value))} ago`;
}

export function labelizeStatus(value = '') {
  return value.replaceAll('_', ' ');
}

export function getTaskStatusTone(status) {
  const tones = {
    TODO: 'bg-slate-500/10 text-slate-700 dark:text-slate-200',
    IN_PROGRESS: 'bg-brand/10 text-brand',
    COMPLETED: 'bg-success/10 text-success',
    OVERDUE: 'bg-danger/10 text-danger'
  };

  return tones[status] || tones.TODO;
}

export function getPriorityTone(priority) {
  const tones = {
    LOW: 'bg-sky-500/10 text-sky-600 dark:text-sky-300',
    MEDIUM: 'bg-warn/10 text-warn',
    HIGH: 'bg-accent/10 text-accent'
  };

  return tones[priority] || tones.MEDIUM;
}

export function getProjectStatusTone(status) {
  const tones = {
    PLANNING: 'bg-slate-500/10 text-slate-700 dark:text-slate-200',
    ACTIVE: 'bg-brand/10 text-brand',
    ON_HOLD: 'bg-warn/10 text-warn',
    COMPLETED: 'bg-success/10 text-success'
  };

  return tones[status] || tones.PLANNING;
}

export function isTaskLate(task) {
  return Boolean(task?.dueDate && task?.status !== 'COMPLETED' && isPast(new Date(task.dueDate)));
}
