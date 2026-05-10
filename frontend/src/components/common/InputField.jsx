import { forwardRef } from 'react';

import { cn } from '../../utils/cn';

export const InputField = forwardRef(function InputField(
  { error, label, textarea = false, className, helperText, ...props },
  ref
) {
  const Component = textarea ? 'textarea' : 'input';

  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <Component
        ref={ref}
        className={cn(
          'ring-focus min-h-[52px] rounded-2xl border border-line bg-white/70 px-4 py-3 text-sm text-ink placeholder:text-muted dark:bg-slate-950/40',
          textarea && 'min-h-[120px] resize-none',
          error && 'border-danger/50',
          className
        )}
        {...props}
      />
      {error ? <span className="text-xs text-danger">{error}</span> : null}
      {!error && helperText ? <span className="text-xs text-muted">{helperText}</span> : null}
    </label>
  );
});
