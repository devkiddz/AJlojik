'use client';

import { useRouter } from 'next/navigation';

import { Heart, ShoppingBagIcon, ShoppingCart } from 'lucide-react';

import { useCart } from '@/features/cart';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export function CartLogics() {
  const router = useRouter();

  const { totalQuantity, itemCount, loading } = useCart();

  const displayedQuantity = totalQuantity > 99 ? '99+' : totalQuantity;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={totalQuantity > 0 ? `Open cart with ${totalQuantity} items` : 'Open cart'}
        className="rounded-full outline-none">
        <div className="flex flex-col gap-1">
          <div className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted transition hover:bg-muted/80 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50">
            <ShoppingBagIcon className="size-4" />

            {!loading && totalQuantity > 0 ? (
              <span className="absolute -right-1 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold leading-4 text-accent-foreground">
                {displayedQuantity}
              </span>
            ) : null}
          </div>

          <span className="hidden text-xs md:inline">Cart</span>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={() => router.push('/cart')}>
          <ShoppingCart className="mr-2 size-4" />

          <span>View cart</span>

          {!loading ? (
            <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {itemCount}
            </span>
          ) : null}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push('/wishlist')}>
          <Heart className="mr-2 size-4" />
          Wishlist
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <div className="px-2 py-2 text-xs text-muted-foreground">
          {loading
            ? 'Loading your cart...'
            : totalQuantity > 0
              ? `${totalQuantity} ${totalQuantity === 1 ? 'item' : 'items'} in your cart`
              : 'Your cart is empty'}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
