import { Logs, PanelLeftClose, X } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

export default function SidebarHeaderContent() {
  // const { setOpen } = useSidebar();
  const { isMobile, setOpen, setOpenMobile } = useSidebar();

  return (
    <div className="relative flex items-center justify-between px-2 py-4">
      <div>
        <h2 className="text-xl font-bold">AJ Store</h2>
        <p className="text-xs text-muted-foreground">Food • Drinks • Events</p>
      </div>

      <Button
        type="button"
        aria-label="Close sidebar"
        onClick={() => {
          if (isMobile) {
            setOpenMobile(false);
          } else {
            setOpen(false);
          }
        }}
        className="rounded-md bg-card/10 p-2 transition hover:bg-transparent md:hidden">
        <PanelLeftClose className="size-5 text-primary" />
      </Button>
    </div>
  );
}
