'use client';

import { Eye, Monitor, Smartphone, Tablet } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type Device = 'desktop' | 'tablet' | 'mobile';

const devices: Array<{
  id: Device;
  label: string;
  icon: typeof Monitor;
  width: string;
}> = [
  { id: 'desktop', label: 'Desktop', icon: Monitor, width: '100%' },
  { id: 'tablet', label: 'Tablet', icon: Tablet, width: '48rem' },
  { id: 'mobile', label: 'Mobile', icon: Smartphone, width: '24rem' }
];

export function StudioPreviewDialog({
  title,
  description,
  children,
  triggerLabel = 'Preview',
  className
}: {
  title: string;
  description: string;
  children: ReactNode | ((device: Device) => ReactNode);
  triggerLabel?: string;
  className?: string;
}) {
  const [device, setDevice] = useState<Device>('desktop');
  const activeDevice = devices.find(option => option.id === device)!;

  return (
    <Dialog>
      <DialogTrigger
        className={cn(
          'inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border/70 bg-background px-4 text-xs font-bold transition hover:bg-muted',
          className
        )}
      >
        <Eye className="size-4" />
        {triggerLabel}
      </DialogTrigger>

      <DialogContent className="flex h-[92dvh] max-w-[96rem] flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border/60 p-5 pr-14">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-1 border-b border-border/60 bg-muted/20 p-3">
          {devices.map(option => {
            const Icon = option.icon;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setDevice(option.id)}
                className={cn(
                  'inline-flex h-9 items-center gap-2 rounded-full px-3 text-xs font-bold transition',
                  device === option.id
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="size-4" />
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-muted/35 p-3 sm:p-5">
          <div
            className="mx-auto min-h-full overflow-hidden rounded-[1.75rem] border border-border/70 bg-background shadow-2xl transition-[width] duration-300"
            style={{
              width: activeDevice.width,
              maxWidth: '100%'
            }}
          >
            {typeof children === 'function' ? children(device) : children}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type StudioPreviewDevice = Device;
