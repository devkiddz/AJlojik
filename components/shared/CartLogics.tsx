'use client';

import {
  Heart,
  ShoppingBag
} from 'lucide-react';

import {
  useState
} from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import { useCart } from '@/features/cart';
import { useWishlist } from '@/features/wishlist';

import {
  ShoppingActivityPanel
} from './ShoppingActivityPanel';

export function CartLogics() {
  const [
    open,
    setOpen
  ] = useState(false);

  const {
    totalQuantity,
    loading: cartLoading
  } = useCart();

  const {
    count: wishlistCount,
    loading: wishlistLoading
  } = useWishlist();

  const displayedQuantity =
    totalQuantity > 99
      ? '99+'
      : totalQuantity;

  return (
    <DropdownMenu
      open={open}
      onOpenChange={setOpen}>
      <DropdownMenuTrigger
        aria-label={`Open shopping activity. ${totalQuantity} cart items and ${wishlistCount} saved products.`}
        className="rounded-full outline-none">
        <div className="flex flex-col gap-1">
          <div className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground transition hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring/50">
            <ShoppingBag className="size-4" />

            {!cartLoading &&
            totalQuantity > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold leading-4 text-accent-foreground shadow-sm">
                {displayedQuantity}
              </span>
            ) : null}

            {!wishlistLoading &&
            wishlistCount > 0 ? (
              <span className="absolute -bottom-1 -left-1 grid size-4 place-items-center rounded-full border-2 border-card bg-rose-500 text-white">
                <Heart className="size-2.5 fill-current" />
              </span>
            ) : null}
          </div>

          <span className="hidden text-xs md:inline">
            Activity
          </span>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className="w-[min(24rem,calc(100vw-1rem))] overflow-hidden rounded-3xl border border-border/60 bg-background/95 p-0 shadow-2xl backdrop-blur-2xl">
        <ShoppingActivityPanel
          onNavigate={() =>
            setOpen(false)
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
