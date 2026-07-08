import { CreditCardIcon, Heart, ShoppingCart } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export function CartLogics() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-none hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 aria-expanded:bg-muted bg-muted hover:bg-muted/80">
        <ShoppingCart className="h-4 w-4" />

        {/* Badge: Positioned cleanly */}
        <span className="absolute animate-pulse -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-white">
          1
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem>
          <CreditCardIcon className="mr-2 h-4 w-4" />
          Billing
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Heart className="mr-2 h-4 w-4" />
          Wishlist
        </DropdownMenuItem>
        <DropdownMenuSeparator />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
