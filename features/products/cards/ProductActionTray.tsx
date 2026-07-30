'use client';

import {
  Heart,
  ListPlus,
  LoaderCircle,
  Minus,
  MoreHorizontal,
  Plus,
  ShoppingBag,
  Sparkles
} from 'lucide-react';

import {
  useState,
  type MouseEvent
} from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import {
  AddToShoppingListDialog,
  useOptionalShoppingLists
} from '@/features/shopping-lists';

import {
  useWishlist
} from '@/features/wishlist';

import {
  cn
} from '@/lib/utils';

import type {
  ProductType,
  ProductVariantType
} from '@/types/types';

import type {
  ProductCardActions
} from './productCardTypes';

import {
  useProductCartQuantity
} from './useProductCartQuantity';

import {
  useProductVariant
} from './useProductVariant';

type ProductActionTrayPresentation =
  | 'overlay'
  | 'inline';

type ProductActionTrayProps = {
  product: ProductType;

  variant?:
    | ProductVariantType
    | null;

  onAddToCart?:
    ProductCardActions['onAddToCart'];

  onAskAI?:
    ProductCardActions['onAskAI'];

  presentation?:
    ProductActionTrayPresentation;

  compact?: boolean;

  /**
   * Existing compatibility flag.
   * It now also enables readable action labels.
   */
  showAddLabel?: boolean;

  /**
   * Displays the complete action language:
   * Add to Cart · Add to List · Wishlist.
   */
  showLabels?: boolean;

  showWishlist?: boolean;

  className?: string;
};

function stopProductActionEvent(
  event: MouseEvent<HTMLElement>
): void {
  event.preventDefault();
  event.stopPropagation();
}

export function ProductActionTray({
  product,
  variant,
  onAddToCart,
  onAskAI,
  presentation = 'overlay',
  compact = false,
  showAddLabel = false,
  showLabels = false,
  showWishlist = true,
  className
}: ProductActionTrayProps) {
  const [
    shoppingListOpen,
    setShoppingListOpen
  ] = useState(false);

  const shoppingLists =
    useOptionalShoppingLists();

  const {
    availableVariant
  } = useProductVariant(
    product
  );

  const {
    toggleWishlist,
    isWishlisted,
    isMutating
  } = useWishlist();

  const activeCommerceVariant =
    variant ??
    availableVariant;

  const {
    variantQuantity,
    cartMutating,
    pendingAction,
    canIncrement,
    canDecrement,
    addOne,
    removeOne
  } = useProductCartQuantity(
    product,
    activeCommerceVariant,
    {
      onAddToCart
    }
  );

  const unavailable =
    !activeCommerceVariant ||
    activeCommerceVariant
      .stockLeft <= 0;

  const reachedStockLimit =
    Boolean(
      activeCommerceVariant &&
        variantQuantity >=
          activeCommerceVariant
            .stockLeft
    );

  const saved =
    isWishlisted(
      product.id
    );

  const wishlistMutating =
    isMutating(
      product.id
    );

  const cartBusy =
    cartMutating ||
    pendingAction !== null;

  const overlay =
    presentation ===
    'overlay';

  const labelled =
    showLabels ||
    showAddLabel;

  const buttonSizeClassName =
    labelled
      ? compact
        ? 'h-8 px-2.5'
        : 'h-9 px-3'
      : compact
        ? 'size-8'
        : 'size-9';

  const iconSizeClassName =
    compact
      ? 'size-3.5'
      : 'size-4';

  const actionClassName = cn(
    `
      pointer-events-auto
      relative inline-flex
      shrink-0 items-center
      justify-center gap-1.5
      rounded-full
    `,
    buttonSizeClassName,
    `
      transition duration-200
      focus-visible:outline-none
      focus-visible:ring-2
      focus-visible:ring-ring
      disabled:cursor-not-allowed
      disabled:opacity-40
    `,
    overlay
      ? [
          'border border-white/20',
          'bg-background/45',
          'text-foreground',
          'shadow-md',
          'backdrop-blur-md',
          'hover:border-white/40',
          'hover:bg-background/85',
          'dark:border-white/10',
          'dark:bg-background/30',
          'dark:hover:bg-background/60'
        ]
      : [
          'border border-border',
          'bg-background',
          'text-foreground',
          'shadow-sm',
          'hover:bg-muted'
        ]
  );

  const handleAdd = (
    event:
      MouseEvent<HTMLElement>
  ): void => {
    stopProductActionEvent(
      event
    );

    if (
      unavailable ||
      cartBusy ||
      !canIncrement
    ) {
      return;
    }

    void addOne();
  };

  const handleRemove = (
    event:
      MouseEvent<HTMLElement>
  ): void => {
    stopProductActionEvent(
      event
    );

    if (
      cartBusy ||
      !canDecrement
    ) {
      return;
    }

    void removeOne();
  };

  const handleWishlist = (
    event:
      MouseEvent<HTMLElement>
  ): void => {
    stopProductActionEvent(
      event
    );

    if (
      wishlistMutating
    ) {
      return;
    }

    void toggleWishlist({
      id:
        product.id,

      name:
        product.name
    });
  };

  const handleOpenShoppingList = (
    event:
      MouseEvent<HTMLElement>
  ): void => {
    stopProductActionEvent(
      event
    );

    if (
      !shoppingLists ||
      !activeCommerceVariant
    ) {
      return;
    }

    setShoppingListOpen(
      true
    );
  };

  const handleAskAI = (
    event:
      MouseEvent<HTMLElement>
  ): void => {
    stopProductActionEvent(
      event
    );

    if (!onAskAI) {
      return;
    }

    void onAskAI(
      product,
      activeCommerceVariant ??
        null
    );
  };

  return (
    <>
      <div
        className={cn(
          `
            pointer-events-auto
            flex items-center
            gap-1.5 rounded-full
            p-1.5
          `,
          labelled &&
            'flex-wrap',
          overlay
            ? [
                'absolute bottom-2 left-1/2 z-30',
                '-translate-x-1/2',
                'border border-white/20',
                'bg-background/20',
                'shadow-xl',
                'backdrop-blur-xl',
                'dark:border-white/10',
                'dark:bg-background/10',
                'opacity-100',
                'sm:translate-y-1',
                'sm:opacity-0',
                'sm:transition',
                'sm:duration-200',
                'sm:group-hover:translate-y-0',
                'sm:group-hover:opacity-100',
                'sm:group-focus-within:translate-y-0',
                'sm:group-focus-within:opacity-100'
              ]
            : [
                'relative',
                'border border-border/70',
                'bg-background/80',
                'shadow-sm',
                'backdrop-blur-md'
              ],
          className
        )}>
        {variantQuantity >
        0 ? (
          <div
            className={cn(
              `
                flex items-center
                rounded-full border
              `,
              overlay
                ? 'border-white/15 bg-background/35'
                : 'border-border bg-muted/40'
            )}>
            {labelled ? (
              <span
                className="
                  pl-2 text-[10px]
                  font-semibold
                  text-muted-foreground
                ">
                Cart
              </span>
            ) : null}

            <button
              type="button"
              title={
                variantQuantity <= 1
                  ? 'Remove from cart'
                  : 'Decrease quantity'
              }
              aria-label={
                variantQuantity <= 1
                  ? `Remove ${product.name} from cart`
                  : `Decrease ${product.name} quantity`
              }
              disabled={
                cartBusy ||
                !canDecrement
              }
              className={cn(
                actionClassName,
                `
                  border-0 bg-transparent
                  shadow-none
                  hover:bg-background/70
                `
              )}
              onClick={
                handleRemove
              }>
              {pendingAction ===
                'decrement' ||
              pendingAction ===
                'remove' ? (
                <LoaderCircle
                  className={cn(
                    iconSizeClassName,
                    'animate-spin'
                  )}
                />
              ) : (
                <Minus
                  className={
                    iconSizeClassName
                  }
                />
              )}
            </button>

            <span
              aria-live="polite"
              className={cn(
                `
                  min-w-6 px-1
                  text-center font-black
                  tabular-nums
                `,
                compact
                  ? 'text-[0.65rem]'
                  : 'text-xs'
              )}>
              {variantQuantity >
              99
                ? '99+'
                : variantQuantity}
            </span>

            <button
              type="button"
              title={
                reachedStockLimit
                  ? 'Available stock reached'
                  : 'Increase quantity'
              }
              aria-label={`Increase ${product.name} quantity`}
              disabled={
                unavailable ||
                cartBusy ||
                !canIncrement
              }
              className={cn(
                actionClassName,
                `
                  border-0 bg-transparent
                  shadow-none
                  hover:bg-background/70
                `
              )}
              onClick={
                handleAdd
              }>
              {pendingAction ===
              'increment' ? (
                <LoaderCircle
                  className={cn(
                    iconSizeClassName,
                    'animate-spin'
                  )}
                />
              ) : (
                <Plus
                  className={
                    iconSizeClassName
                  }
                />
              )}
            </button>
          </div>
        ) : (
          <button
            type="button"
            title={
              unavailable
                ? 'Product is unavailable'
                : 'Add to cart'
            }
            aria-label={
              unavailable
                ? `${product.name} is unavailable`
                : `Add ${product.name} to cart`
            }
            disabled={
              unavailable ||
              cartBusy ||
              !canIncrement
            }
            className={
              actionClassName
            }
            onClick={
              handleAdd
            }>
            {pendingAction ===
            'increment' ? (
              <LoaderCircle
                className={cn(
                  iconSizeClassName,
                  'animate-spin'
                )}
              />
            ) : (
              <ShoppingBag
                className={
                  iconSizeClassName
                }
              />
            )}

            {labelled ? (
              <span>
                {unavailable
                  ? 'Unavailable'
                  : 'Add to Cart'}
              </span>
            ) : null}
          </button>
        )}

        <button
          type="button"
          title={
            shoppingLists
              ? 'Add to Shopping List'
              : 'Sign in to use Shopping Lists'
          }
          aria-label={`Add ${product.name} to a Shopping List`}
          disabled={
            !shoppingLists ||
            !activeCommerceVariant
          }
          className={cn(
            actionClassName,
            `
              text-emerald-700
              dark:text-emerald-300
            `
          )}
          onClick={
            handleOpenShoppingList
          }>
          <ListPlus
            className={
              iconSizeClassName
            }
          />

          {labelled ? (
            <span>
              Add to List
            </span>
          ) : null}
        </button>

        {showWishlist ? (
          <button
            type="button"
            title={
              saved
                ? 'Remove from wishlist'
                : 'Add to wishlist'
            }
            aria-label={
              saved
                ? `Remove ${product.name} from wishlist`
                : `Save ${product.name} to wishlist`
            }
            aria-pressed={
              saved
            }
            disabled={
              wishlistMutating
            }
            className={cn(
              actionClassName,
              `
                transition-colors
                duration-200
              `,
              saved
                ? [
                    'border-rose-500/50',
                    'bg-rose-500/15',
                    'text-rose-500',
                    'hover:bg-rose-500/20',
                    'dark:bg-rose-500/20',
                    'dark:hover:bg-rose-500/25'
                  ]
                : 'text-foreground'
            )}
            onClick={
              handleWishlist
            }>
            {wishlistMutating ? (
              <LoaderCircle
                className={cn(
                  iconSizeClassName,
                  'animate-spin'
                )}
              />
            ) : (
              <Heart
                className={cn(
                  iconSizeClassName,
                  `
                    transition-[color,fill,transform]
                    duration-200
                  `,
                  saved
                    ? [
                        'scale-110',
                        'fill-rose-500',
                        'text-rose-500'
                      ]
                    : [
                        'fill-transparent',
                        'text-current'
                      ]
                )}
              />
            )}

            {labelled ? (
              <span>
                {saved
                  ? 'Saved'
                  : 'Wishlist'}
              </span>
            ) : null}
          </button>
        ) : null}

        {onAskAI &&
        !compact ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              type="button"
              title="More product options"
              aria-label={`More options for ${product.name}`}
              className={
                actionClassName
              }
              onClick={event => {
                event.stopPropagation();
              }}>
              <MoreHorizontal
                className={
                  iconSizeClassName
                }
              />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="
                z-50 w-56
                rounded-2xl
                border-border/70
                p-1.5 shadow-xl
              "
              onClick={event => {
                event.stopPropagation();
              }}>
              <DropdownMenuGroup>
                <DropdownMenuLabel
                  className="
                    px-2.5 py-2
                    text-[0.65rem]
                    font-bold uppercase
                    tracking-[0.14em]
                    text-muted-foreground
                  ">
                  Product intelligence
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="
                    cursor-pointer
                    gap-3 rounded-xl
                    px-3 py-2.5
                  "
                  onClick={
                    handleAskAI
                  }>
                  <Sparkles className="size-4 text-primary" />

                  <span>
                    Ask AI
                  </span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>

      {shoppingLists ? (
        <AddToShoppingListDialog
          open={
            shoppingListOpen
          }
          product={
            product
          }
          variant={
            activeCommerceVariant
          }
          onClose={() => {
            setShoppingListOpen(
              false
            );
          }}
        />
      ) : null}
    </>
  );
}
