import type { ReactNode } from 'react';

import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

import { cn } from '@/lib/utils';

type AuthNoticeVariant = 'error' | 'warning' | 'success' | 'info';

type AuthNoticeProps = {
  variant: AuthNoticeVariant;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
};

const variantStyles: Record<
  AuthNoticeVariant,
  {
    container: string;
    icon: string;
    Icon: typeof AlertCircle;
  }
> = {
  error: {
    container: 'border-destructive/25 bg-destructive/10 text-destructive',
    icon: 'bg-destructive/15 text-destructive',
    Icon: AlertCircle
  },

  warning: {
    container: 'border-amber-500/25 bg-amber-500/10 text-amber-950 dark:text-amber-100',
    icon: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
    Icon: AlertTriangle
  },

  success: {
    container: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100',
    icon: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    Icon: CheckCircle2
  },

  info: {
    container: 'border-primary/25 bg-primary/10 text-foreground',
    icon: 'bg-primary/15 text-primary',
    Icon: Info
  }
};

export default function AuthNotice({ variant, title, description, children, className }: AuthNoticeProps) {
  const { container, icon, Icon } = variantStyles[variant];

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      className={cn('rounded-2xl border p-3.5 shadow-sm backdrop-blur-md', container, className)}>
      <div className="flex items-start gap-3">
        <span className={cn('grid size-9 shrink-0 place-items-center rounded-xl', icon)}>
          <Icon className="size-4" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{title}</p>

          {description ? <p className="mt-1 text-sm leading-5 opacity-80">{description}</p> : null}

          {children ? <div className="mt-3">{children}</div> : null}
        </div>
      </div>
    </div>
  );
}
