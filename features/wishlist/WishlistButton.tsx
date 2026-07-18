'use client';

import { Heart, LoaderCircle } from 'lucide-react';

import type { MouseEvent } from 'react';

import { cn } from '@/lib/utils';

import { useWishlist } from './useWishlist';

type WishlistButtonAppearance = 'card' | 'overlay' | 'dark-overlay' | 'plain';

type WishlistButtonProps = {
  productId: string;
  productName?: string;

  appearance?: WishlistButtonAppearance;

  className?: string;
  iconClassName?: string;

  stopPropagation?: boolean;
};

const appearanceClasses = {
  card: 'grid size-9 place-items-center rounded-full border bg-background/85 shadow-sm backdrop-blur-md transition hover:scale-105 hover:bg-background',

  overlay:
    'grid size-10 place-items-center rounded-full border bg-background/85 shadow-md backdrop-blur-md transition hover:scale-105 hover:bg-background',

  'dark-overlay':
    'grid size-11 place-items-center rounded-full border border-white/15 bg-black/35 text-white backdrop-blur-md transition hover:bg-black/60',

  plain: 'grid size-9 place-items-center rounded-full transition hover:bg-muted'
} satisfies Record<WishlistButtonAppearance, string>;

export function WishlistButton({
  productId,
  productName,
  appearance = 'card',
  className,
  iconClassName,
  stopPropagation = true
}: WishlistButtonProps) {
  const { toggleWishlist, isWishlisted, isMutating } = useWishlist();

  const liked = isWishlisted(productId);

  const mutating = isMutating(productId);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (stopPropagation) {
      event.stopPropagation();
    }

    if (mutating) {
      return;
    }

    void toggleWishlist({
      id: productId,
      name: productName
    });
  };

  return (
    <button
      type="button"
      aria-pressed={liked}
      aria-busy={mutating}
      aria-label={
        liked
          ? `Remove ${productName ?? 'product'} from wishlist`
          : `Save ${productName ?? 'product'} to wishlist`
      }
      title={liked ? 'Remove from wishlist' : 'Save to wishlist'}
      disabled={mutating}
      onClick={handleClick}
      className={cn(
        appearanceClasses[appearance],

        liked && appearance !== 'dark-overlay' && 'border-secondary/30 text-secondary',

        mutating && 'cursor-wait opacity-70',

        className
      )}>
      {mutating ? (
        <LoaderCircle className={cn('size-4 animate-spin', iconClassName)} />
      ) : (
        <Heart
          className={cn(
            'size-4',

            appearance === 'dark-overlay' && 'size-5',

            liked && 'fill-current',

            liked && appearance === 'dark-overlay' && 'fill-secondary text-secondary',

            iconClassName
          )}
        />
      )}
    </button>
  );
}
