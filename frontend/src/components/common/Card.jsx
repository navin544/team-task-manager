import { cn } from '../../utils/cn';

export function Card({ children, className, ...props }) {
  return (
    <div className={cn('surface-panel rounded-[1.75rem] p-5', className)} {...props}>
      {children}
    </div>
  );
}
