'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { useWorkspace } from '@/features/workspace';

import { CartContext } from './cartContext';
import { CartEngine } from './cartEngine';

import {
  calculateCartItemCount,
  calculateCartQuantity,
  calculateCartSubtotal
} from './utils/cartCalculations';

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

  /*
   * Use the primitive workspace ID as the dependency.
   *
   * Depending on the complete activeWorkspace object could recreate
   * the runtime and callbacks when its object reference changes.
   */
  const workspaceId = activeWorkspace?.id ?? null;

  const runtime = useMemo<CartRuntime>(
    () => ({
      workspaceId,
      isGuest: workspaceId === null || workspaceId === 'guest-live'
    }),
    [workspaceId]
  );

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /*
   * Ensures an older cart request cannot overwrite a newer
   * workspace cart response.
   */
  const refreshRequestIdRef = useRef(0);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  const refreshCart = useCallback(async (): Promise<void> => {
    const requestId = ++refreshRequestIdRef.current;

    setLoading(true);
    setError(null);

    try {
      const nextItems = await CartEngine.get(runtime);

      if (requestId !== refreshRequestIdRef.current) {
        return;
      }

      setItems(nextItems);
    } catch (refreshError) {
      if (requestId !== refreshRequestIdRef.current) {
        return;
      }

      setError(getCartErrorMessage(refreshError, 'Unable to load your cart.'));
    } finally {
      if (requestId === refreshRequestIdRef.current) {
        setLoading(false);
      }
    }
  }, [runtime]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshCart();
    }, 0);

    return () => window.clearTimeout(timer);
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
    async (input: UpdateCartQuantityInput): Promise<void> => {
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
    async (itemId: string): Promise<void> => {
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

  const clearCart = useCallback(async (): Promise<void> => {
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
    (variantId: string): boolean => items.some(item => item.variantId === variantId),
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
