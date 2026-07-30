'use client';

import { useMemo, useState } from 'react';
import {
  ExternalLink,
  Laptop,
  Monitor,
  RefreshCw,
  Smartphone,
  Tablet,
  X
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

const devices: Array<{
  id: PreviewDevice;
  label: string;
  width: string;
  icon: typeof Monitor;
}> = [
  { id: 'desktop', label: 'Desktop', width: '100%', icon: Monitor },
  { id: 'tablet', label: 'Tablet', width: '768px', icon: Tablet },
  { id: 'mobile', label: 'Mobile', width: '390px', icon: Smartphone }
];

export function StoreStudioPreviewer() {
  const [open, setOpen] = useState(false);
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [refreshVersion, setRefreshVersion] = useState(0);

  const activeDevice = devices.find(option => option.id === device) ?? devices[0]!;
  const previewUrl = useMemo(
    () => `/store?studioPreview=1&previewVersion=${refreshVersion}`,
    [refreshVersion]
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 py-2 text-xs font-bold transition hover:bg-muted">
        <Laptop className="size-4" />
        Studio preview
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="h-[min(94dvh,64rem)] w-[min(97vw,96rem)] max-w-none grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden rounded-[2rem] border-border/70 bg-background p-0 shadow-2xl">
          <DialogTitle className="sr-only">Store Studio preview</DialogTitle>
          <DialogDescription className="sr-only">
            Preview the live customer Store inside desktop, tablet and mobile frames.
          </DialogDescription>

          <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-card/90 px-4 py-3 sm:px-5">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-primary/70">Studio previewer</p>
              <h2 className="mt-0.5 truncate text-lg font-black">Live customer Store</h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-full border border-border/70 bg-muted/60 p-1">
                {devices.map(option => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setDevice(option.id)}
                      aria-pressed={device === option.id}
                      className={cn(
                        'inline-flex h-9 items-center gap-2 rounded-full px-3 text-xs font-bold transition',
                        device === option.id
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}>
                      <Icon className="size-4" />
                      <span className="hidden sm:inline">{option.label}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setRefreshVersion(current => current + 1)}
                className="grid size-10 place-items-center rounded-full border border-border/70 bg-background transition hover:bg-muted"
                aria-label="Refresh Store preview">
                <RefreshCw className="size-4" />
              </button>

              <a
                href="/store"
                target="_blank"
                rel="noreferrer"
                className="grid size-10 place-items-center rounded-full border border-border/70 bg-background transition hover:bg-muted"
                aria-label="Open Store in a new tab">
                <ExternalLink className="size-4" />
              </a>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-10 place-items-center rounded-full bg-foreground text-background"
                aria-label="Close preview">
                <X className="size-4" />
              </button>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-auto bg-muted/40 p-3 sm:p-5">
            <div
              className="mx-auto h-full min-h-[36rem] overflow-hidden rounded-2xl border border-border/70 bg-background shadow-2xl transition-[width] duration-300"
              style={{ width: activeDevice.width, maxWidth: '100%' }}>
              <iframe
                key={previewUrl}
                src={previewUrl}
                title={`AJ Logik ${activeDevice.label} Store preview`}
                className="size-full min-h-[36rem] bg-background"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
