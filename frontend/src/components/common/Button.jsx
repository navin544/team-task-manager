import { LoaderCircle } from 'lucide-react';

import { cn } from '../../utils/cn';

const variants = {
  primary: 'bg-brand text-white hover:bg-brand/90',
  secondary: 'border border-line bg-white/60 text-ink hover:bg-white dark:bg-slate-900/50',
  ghost: 'text-muted hover:bg-white/50 hover:text-ink dark:hover:bg-slate-900/40',
  danger: 'bg-danger text-white hover:bg-danger/90'
};

export function Button({
  children,
  className,
  isLoading = false,
  type = 'button',
  variant = 'primary',
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        'ring-focus inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70',
        variants[variant],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}
