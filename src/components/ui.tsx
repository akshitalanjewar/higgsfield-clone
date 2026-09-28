import { type ReactNode } from 'react';
import { clsx } from 'clsx';

interface Props {
  children: ReactNode;
  className?: string;
}

export function cn(...args: Parameters<typeof clsx>) {
  return clsx(...args);
}

export function Badge({ children, className }: Props) {
  return (
    <span className={cn(
      'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
      className
    )}>
      {children}
    </span>
  );
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cn('border-dark-border', className)} />;
}

export function SectionLabel({ children, className }: Props) {
  return (
    <p className={cn('text-[10px] font-semibold uppercase tracking-widest text-dark-muted mb-2', className)}>
      {children}
    </p>
  );
}
