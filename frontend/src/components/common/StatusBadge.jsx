import { cn } from '../../utils/cn';
import {
  getPriorityTone,
  getProjectStatusTone,
  getTaskStatusTone,
  labelizeStatus
} from '../../utils/formatters';

export function StatusBadge({ value, type = 'task' }) {
  const tone =
    type === 'task'
      ? getTaskStatusTone(value)
      : type === 'priority'
        ? getPriorityTone(value)
        : getProjectStatusTone(value);

  return (
    <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-semibold', tone)}>
      {labelizeStatus(value)}
    </span>
  );
}
