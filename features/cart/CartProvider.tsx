'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useActionFeedback } from '@/features/action-feedback';

import { useCatalog } from '@/features/catalog';

import { useWorkspace } from '@/features/workspace';

import { useIdentity } from '@/providers/IdentityProvider';

import { CartContext } from './cartContext';

import { CartEngine } from './cartEngine';

import {
  CART_ADD_ACTION,
  createCartAddActionPayload,
  parseCartAddActionPayload
} from './cartProtectedAction';

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

  const { products } = useCatalog();

  const { isAuthenticated, isPending } = useIdentity();

  const { runProtectedAction, registerProtectedActionHandler } = useActionFeedback();

  const runtime = useMemo<CartRuntime>(
    () => ({
      workspaceId: activeWorkspace?.id ?? null,

      isGuest: !activeWorkspace || activeWorkspace.id === 'guest-live'
    }),
    [activeWorkspace]
  );

  const canUseAccountCart = Boolean(isAuthenticated && !isPending && runtime.workspaceId && !runtime.isGuest);

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
    void refreshCart();
  }, [refreshCart]);

  /**
   * The internal cart writer.
   *
   * It does not open the Authentication Gate.
   * Both immediate authenticated actions and resumed
   * pending actions eventually arrive here.
   */
  const executeAddToCart = useCallback(
    async (input: AddToCartInput): Promise<CartItem | null> => {
      if (!canUseAccountCart) {
        throw new Error('Your AJ Logik account workspace is still loading.');
      }

      setMutating(true);
      setError(null);

      try {
        const result = await CartEngine.add(runtime, input);

        setItems(result.items);

        return result.affectedItem ?? null;
      } catch (addError) {
        const message = getCartErrorMessage(addError, 'Unable to add this product.');

        setError(message);

        throw new Error(message);
      } finally {
        setMutating(false);
      }
    },
    [canUseAccountCart, runtime]
  );

  /**
   * Resolves a serializable protected-action payload
   * back into the complete catalogue objects needed
   * by CartEngine.
   */
  const executeCartActionPayload = useCallback(
    async (payload: unknown): Promise<CartItem | null> => {
      const action = parseCartAddActionPayload(payload);

      const product = products.find(currentProduct => String(currentProduct.id) === action.productId);

      if (!product) {
        throw new Error('This product is no longer available in the AJ Logik catalogue.');
      }

      const variant = product.variants.find(currentVariant => String(currentVariant.id) === action.variantId);

      if (!variant) {
        throw new Error('The selected product option is no longer available.');
      }

      if (variant.stockLeft <= 0) {
        throw new Error(`${product.name} is currently out of stock.`);
      }

      return executeAddToCart({
        product,
        variant,
        quantity: action.quantity
      });
    },
    [executeAddToCart, products]
  );

  /**
   * Registers the handler that resumes cart.add
   * after a successful sign-in or sign-up.
   */
  useEffect(() => {
    if (!canUseAccountCart) {
      return;
    }

    const unregister = registerProtectedActionHandler(CART_ADD_ACTION, async payload => {
      await executeCartActionPayload(payload);
    });

    return unregister;
  }, [canUseAccountCart, executeCartActionPayload, registerProtectedActionHandler]);

  /**
   * Public Add-to-Cart action.
   *
   * Guests are bounced to authentication.
   * Authenticated customers execute immediately.
   */
  const addToCart = useCallback(
    async (input: AddToCartInput): Promise<CartItem | null> => {
      const payload = createCartAddActionPayload(input);

      let affectedItem: CartItem | null = null;

      const productName = input.product.name;

      const variantLabel = input.variant.label;

      await runProtectedAction({
        action: {
          type: CART_ADD_ACTION,

          payload,

          title: `Add ${productName} to your cart?`,

          description: `${variantLabel} will be added to your active AJ Logik shopping workspace.`,

          successTitle: 'Added to your cart',

          successDescription: `${productName} — ${variantLabel} is now ready in your cart.`
        },

        gate: {
          title: 'Sign in to build your cart',

          description:
            'Your AJ Logik cart is connected to your account so your selected products, quantities and shopping progress remain available across visits.',

          benefits: [
            'Keep your cart connected to your account.',
            'Continue shopping across devices.',
            'Return to your selected products without starting again.'
          ]
        },

        execute: async storedPayload => {
          affectedItem = await executeCartActionPayload(storedPayload);
        }
      });

      return affectedItem;
    },
    [executeCartActionPayload, runProtectedAction]
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
    (variantId: string) => items.some(item => String(item.variantId) === String(variantId)),
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
