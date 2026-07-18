'use client';

import { useCallback } from 'react';

import {
  useActionFeedback,
  type JsonValue
} from '@/features/action-feedback';

type WishlistActionPayload = {
  productId: string;
};

async function addProductToWishlist(
  payload: JsonValue
): Promise<void> {
  const {
    productId
  } = payload as WishlistActionPayload;

  const response = await fetch('/api/wishlist', {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json'
    },

    body: JSON.stringify({
      productId
    })
  });

  if (!response.ok) {
    throw new Error(
      'The product could not be saved to your wishlist.'
    );
  }
}

export function useWishlistAction() {
  const {
    runProtectedAction
  } = useActionFeedback();

  const saveToWishlist = useCallback(
    async (productId: string) => {
      return runProtectedAction({
        action: {
          type: 'wishlist.add',

          payload: {
            productId
          },

          title: 'Sign in to save this product',

          description:
            'Your wishlist belongs to your personal AJ Logik experience.',

          successTitle: 'Saved to wishlist',

          successDescription:
            'The product is now available in your wishlist.'
        },

        gate: {
          title: 'Sign in to save this product',

          description:
            'Create an account or sign in to preserve your wishlist and continue across devices.'
        },

        execute: addProductToWishlist
      });
    },
    [runProtectedAction]
  );

  return {
    saveToWishlist
  };
}