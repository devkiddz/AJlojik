'use client';

import type { ReactNode } from 'react';
import { useFormStatus } from 'react-dom';

import { LoaderCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

type StoreStudioSubmitButtonProps = {
  children: ReactNode;
  className?: string;
  pendingLabel?: string;
};

export function StoreStudioSubmitButton({
  children,
  className,
  pendingLabel = 'Saving…'
}: StoreStudioSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 text-xs font-bold transition disabled:cursor-wait disabled:opacity-60',
        className
      )}
    >
      {pending ? (
        <>
          <LoaderCircle className="size-4 animate-spin" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
