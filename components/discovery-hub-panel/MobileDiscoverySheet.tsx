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
        side="right"
        className="
          !fixed
          !inset-y-0
          !right-0
          !h-dvh
          !w-screen
          !max-w-none
          overflow-hidden
          border-0
          bg-background
          p-0
          lg:hidden
        ">
        <SheetHeader className="sr-only">
          <SheetTitle>Discovery Hub</SheetTitle>

          <SheetDescription>Explore your personalized AJ Logik workspace.</SheetDescription>
        </SheetHeader>

        <div className="h-full min-h-0 w-full overflow-hidden">
          <DiscoverExperienceShell />
        </div>
      </SheetContent>
    </Sheet>
  );
}
