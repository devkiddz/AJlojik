'use client';

import { useEffect } from 'react';

import { useActionFeedback } from '@/features/action-feedback';

import { parseWishlistActionPayload, WISHLIST_ADD_ACTION, WISHLIST_REMOVE_ACTION } from './wishlistTypes';

import { useWishlist } from './useWishlist';

export function WishlistActionBridge() {
  const { registerProtectedActionHandler } = useActionFeedback();

  const { canPersist, addProduct, removeProduct } = useWishlist();

  useEffect(() => {
    if (!canPersist) {
      return;
    }

    const unregisterAdd = registerProtectedActionHandler(WISHLIST_ADD_ACTION, async payload => {
      const { productId } = parseWishlistActionPayload(payload);

      await addProduct(productId);
    });

    const unregisterRemove = registerProtectedActionHandler(WISHLIST_REMOVE_ACTION, async payload => {
      const { productId } = parseWishlistActionPayload(payload);

      await removeProduct(productId);
    });

    return () => {
      unregisterAdd();
      unregisterRemove();
    };
  }, [addProduct, canPersist, registerProtectedActionHandler, removeProduct]);

  return null;
}
