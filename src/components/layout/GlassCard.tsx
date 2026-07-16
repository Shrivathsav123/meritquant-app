import { clsx } from 'clsx';
import type { HTMLAttributes } from 'react';
export function GlassCard({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('glass-surface rounded-3xl', className)} {...rest} />;
}
