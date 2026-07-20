'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { cn } from '@/lib/utils';

export default function PasswordField({ className, ...props }: React.ComponentProps<'input'>) {
  const [visible, setVisible] = useState(false);

  return <span className="relative block w-full"><input {...props} type={visible ? 'text' : 'password'} className={cn('pr-12', className)} /><button type="button" onClick={() => setVisible(current => !current)} aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible} className="absolute inset-y-0 right-1 my-auto grid size-10 place-items-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></span>;
}
