'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useWorkspace } from '@/features/workspace';

import { CartEngine } from './cartEngine';

import {
  calculateCartItemCount,
  calculateCartQuantity,
  calculateCartSubtotal
} from './utils/cartCalculations';

import { CartContext } from './cartContext';

import { getCartErrorMessage } from './utils/cartErrors';

import type {
  AddToCartInput,
  CartContextValue,
  CartItem,
  CartRuntime,
  UpdateCartQuantityInput
} from './cartTypes';

type CartProviderProps = {
  children: ReactNode;
};

export function CartProvider({ children }: CartProviderProps) {
  const { activeWorkspace } = useWorkspace();

  const runtime = useMemo<CartRuntime>(
    () => ({
      workspaceId: activeWorkspace?.id ?? null,

      isGuest: !activeWorkspace || activeWorkspace.id === 'guest-live'
    }),
    [activeWorkspace]
  );

  const [items, setItems] = useState<CartItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [mutating, setMutating] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshCart = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextItems = await CartEngine.get(runtime);

      setItems(nextItems);
    } catch (refreshError) {
      setError(getCartErrorMessage(refreshError, 'Unable to load your cart.'));
    } finally {
      setLoading(false);
    }
  }, [runtime]);

  useEffect(() => {
    const refreshTimer = window.setTimeout(() => {
      void refreshCart();
    }, 0);

    return () => {
      window.clearTimeout(refreshTimer);
    };
  }, [refreshCart]);

  const addToCart = useCallback(
    async (input: AddToCartInput): Promise<CartItem | null> => {
      setMutating(true);
      setError(null);

      try {
        const result = await CartEngine.add(runtime, input);

        setItems(result.items);

        return result.affectedItem ?? null;
      } catch (addError) {
        setError(getCartErrorMessage(addError, 'Unable to add this product.'));

        return null;
      } finally {
        setMutating(false);
      }
    },
    [runtime]
  );

  const updateQuantity = useCallback(
    async (input: UpdateCartQuantityInput) => {
      setMutating(true);
      setError(null);

      try {
        const result = await CartEngine.update(runtime, input);

        setItems(result.items);
      } catch (updateError) {
        setError(getCartErrorMessage(updateError, 'Unable to update the cart.'));
      } finally {
        setMutating(false);
      }
    },
    [runtime]
  );

  const removeFromCart = useCallback(
    async (itemId: string) => {
      setMutating(true);
      setError(null);

      try {
        const result = await CartEngine.remove(runtime, itemId);

        setItems(result.items);
      } catch (removeError) {
        setError(getCartErrorMessage(removeError, 'Unable to remove this item.'));
      } finally {
        setMutating(false);
      }
    },
    [runtime]
  );

  const clearCart = useCallback(async () => {
    setMutating(true);
    setError(null);

    try {
      const result = await CartEngine.clear(runtime);

      setItems(result.items);
    } catch (clearCartError) {
      setError(getCartErrorMessage(clearCartError, 'Unable to clear your cart.'));
    } finally {
      setMutating(false);
    }
  }, [runtime]);

  const itemCount = useMemo(() => calculateCartItemCount(items), [items]);

  const totalQuantity = useMemo(() => calculateCartQuantity(items), [items]);

  const subtotal = useMemo(() => calculateCartSubtotal(items), [items]);

  const containsVariant = useCallback(
    (variantId: string) => items.some(item => item.variantId === variantId),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,

      itemCount,
      totalQuantity,
      subtotal,

      loading,
      mutating,
      error,

      refreshCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      containsVariant,
      clearError
    }),
    [
      items,
      itemCount,
      totalQuantity,
      subtotal,
      loading,
      mutating,
      error,
      refreshCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      containsVariant,
      clearError
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
