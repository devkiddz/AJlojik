'use client';

import {
  useCallback,
  useMemo,
  useRef,
  useState
} from 'react';

import {
  useCart
} from '@/features/cart';

import type {
  ProductType,
  ProductVariantType
} from '@/types/types';

import type {
  ProductCardActions
} from './productCardTypes';

type ProductCartAction =
  | 'increment'
  | 'decrement'
  | 'remove';

type UseProductCartQuantityOptions = {
  onAddToCart?:
    ProductCardActions['onAddToCart'];
};

type ProductReference =
  | ProductType
  | string;

export function useProductCartQuantity(
  productReference: ProductReference,
  variant?: ProductVariantType | null,
  options: UseProductCartQuantityOptions = {}
) {
  const {
    items,
    addToCart,
    updateQuantity,
    removeFromCart,
    mutating
  } = useCart();

  const [pendingAction, setPendingAction] =
    useState<ProductCartAction | null>(
      null
    );

  const pendingActionRef =
    useRef<ProductCartAction | null>(
      null
    );

  const product =
    typeof productReference === 'string'
      ? null
      : productReference;

  const productId =
    typeof productReference === 'string'
      ? productReference
      : productReference.id;

  const variantId =
    variant
      ? String(variant.id)
      : null;

  const productItems =
    useMemo(
      () =>
        items.filter(
          item =>
            String(item.productId) ===
            String(productId)
        ),
      [items, productId]
    );

  const cartItem =
    useMemo(
      () =>
        variantId
          ? productItems.find(
              item =>
                String(item.variantId) ===
                variantId
            ) ?? null
          : null,
      [productItems, variantId]
    );

  const productQuantity =
    useMemo(
      () =>
        productItems.reduce(
          (total, item) =>
            total + item.quantity,
          0
        ),
      [productItems]
    );

  const variantQuantity =
    cartItem?.quantity ?? 0;

  const variantStock =
    variant?.stockLeft ?? 0;

  const canIncrement =
    Boolean(
      product &&
      variant &&
      variantStock > 0 &&
      variantQuantity < variantStock
    );

  const canDecrement =
    Boolean(cartItem);

  const runCartAction =
    useCallback(
      async (
        action: ProductCartAction,
        operation: () => Promise<void>
      ): Promise<void> => {
        if (
          mutating ||
          pendingActionRef.current
        ) {
          return;
        }

        pendingActionRef.current =
          action;

        setPendingAction(action);

        try {
          await operation();
        } finally {
          pendingActionRef.current =
            null;

          setPendingAction(null);
        }
      },
      [mutating]
    );

  const addOne =
    useCallback(
      async (): Promise<void> => {
        if (
          !product ||
          !variant ||
          !canIncrement
        ) {
          return;
        }

        await runCartAction(
          'increment',
          async () => {
            if (cartItem) {
              await updateQuantity({
                itemId: cartItem.id,
                quantity:
                  cartItem.quantity + 1
              });

              return;
            }

            if (options.onAddToCart) {
              await options.onAddToCart(
                product,
                variant
              );

              return;
            }

            await addToCart({
              product,
              variant,
              quantity: 1
            });
          }
        );
      },
      [
        addToCart,
        canIncrement,
        cartItem,
        options.onAddToCart,
        product,
        runCartAction,
        updateQuantity,
        variant
      ]
    );

  const removeOne =
    useCallback(
      async (): Promise<void> => {
        if (!cartItem) {
          return;
        }

        await runCartAction(
          'decrement',
          async () => {
            if (cartItem.quantity <= 1) {
              await removeFromCart(
                cartItem.id
              );

              return;
            }

            await updateQuantity({
              itemId: cartItem.id,
              quantity:
                cartItem.quantity - 1
            });
          }
        );
      },
      [
        cartItem,
        removeFromCart,
        runCartAction,
        updateQuantity
      ]
    );

  const removeVariant =
    useCallback(
      async (): Promise<void> => {
        if (!cartItem) {
          return;
        }

        await runCartAction(
          'remove',
          async () => {
            await removeFromCart(
              cartItem.id
            );
          }
        );
      },
      [
        cartItem,
        removeFromCart,
        runCartAction
      ]
    );

  return {
    cartItem,

    productQuantity,
    variantQuantity,

    /**
     * Compatibility alias for older product-level badges.
     */
    quantity:
      variantId
        ? variantQuantity
        : productQuantity,

    cartMutating:
      mutating,

    pendingAction,

    canIncrement,
    canDecrement,

    addOne,
    removeOne,
    removeVariant
  };
}
