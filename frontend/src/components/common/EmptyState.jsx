import { Button } from './Button';

export function EmptyState({ actionLabel, description, onAction, title }) {
  return (
    <div className="surface-panel grid justify-items-center gap-4 rounded-[1.75rem] px-8 py-14 text-center">
      <div className="space-y-2">
        <h3 className="font-display text-2xl font-bold text-ink">{title}</h3>
        <p className="max-w-md text-sm text-muted">{description}</p>
      </div>
      {actionLabel ? <Button onClick={onAction}>{actionLabel}</Button> : null}
    </div>
  );
}
