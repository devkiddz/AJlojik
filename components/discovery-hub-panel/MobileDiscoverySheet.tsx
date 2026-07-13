'use client';

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

import DiscoverExperienceShell from './DiscoverExperienceShell';

type MobileDiscoverySheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function MobileDiscoverySheet({ open, onOpenChange }: MobileDiscoverySheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[92dvh] overflow-hidden rounded-t-3xl border-x border-t p-0 lg:hidden">
        <SheetHeader className="sr-only">
          <SheetTitle>Discovery Hub</SheetTitle>

          <SheetDescription>Your personalized AJ Logik workspace.</SheetDescription>
        </SheetHeader>

        {/* Sheet handle */}
        <div className="flex h-7 shrink-0 items-center justify-center">
          <span className="h-1 w-12 rounded-full bg-muted-foreground/25" />
        </div>

        {/* Discovery Hub */}
        <div className="h-[calc(92dvh-1.75rem)] overflow-hidden px-3 pb-5">
          <DiscoverExperienceShell />
        </div>
      </SheetContent>
    </Sheet>
  );
}
