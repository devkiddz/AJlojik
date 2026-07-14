import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

type BaseTriggerButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
};

export default function BaseTriggerButton({
  children,
  className,
  type = 'button',
  ...props
}: BaseTriggerButtonProps) {
  return (
    <button
      type={type}
      className={cn('outline-none focus-visible:ring-2 focus-visible:ring-ring', className)}
      {...props}>
      {children}
    </button>
  );
}
