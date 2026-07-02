import { X } from 'lucide-react';
import { useSidebar } from '../ui/sidebar';
import { Button } from '../ui/button';

export default function SidebarHeaderContent() {
  const { setOpen } = useSidebar();

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div>
        <h2 className="text-xl font-bold">AJ Store</h2>
        <p className="text-xs text-muted-foreground">Food • Drinks • Events</p>
      </div>

      <Button
        type="button"
        aria-label="Close sidebar"
        onClick={() => setOpen(false)}
        className="
          rounded-md
          p-2
          hover:bg-muted
          transition
          cursor-pointer
          md:hidden
        ">
        <X className="size-4 absolut top-0" />
      </Button>
    </div>
  );
}
