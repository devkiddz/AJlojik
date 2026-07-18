import type {
  JsonValue
} from '@/features/action-feedback';

export const WISHLIST_ADD_ACTION =
  'wishlist.add';

export const WISHLIST_REMOVE_ACTION =
  'wishlist.remove';

export type WishlistActionType =
  | typeof WISHLIST_ADD_ACTION
  | typeof WISHLIST_REMOVE_ACTION;

export type WishlistProductReference = {
  id: string;
  name?: string;
};

export type WishlistActionPayload = {
  productId: string;
  productName?: string;
};

export type WishlistResponse = {
  productIds: string[];
};

export type WishlistMutationResponse =
  WishlistResponse & {
    affectedProductId: string;
    liked: boolean;
  };

export type WishlistState = {
  productIds: string[];

  count: number;

  loading: boolean;
  error: string | null;

  canPersist: boolean;

  mutatingProductIds: Set<string>;
};

export type WishlistContextValue =
  WishlistState & {
    refreshWishlist: () => Promise<void>;

    addProduct: (
      productId: string
    ) => Promise<void>;

    removeProduct: (
      productId: string
    ) => Promise<void>;

    toggleWishlist: (
      product: WishlistProductReference
    ) => Promise<boolean>;

    isWishlisted: (
      productId: string
    ) => boolean;

    isMutating: (
      productId: string
    ) => boolean;

    clearError: () => void;
  };

export function createWishlistActionPayload(
  product: WishlistProductReference
): JsonValue {
  const productName =
    product.name?.trim();

  return productName
    ? {
        productId: product.id,
        productName
      }
    : {
        productId: product.id
      };
}

export function parseWishlistActionPayload(
  payload: JsonValue
): WishlistActionPayload {
  if (
    !payload ||
    typeof payload !== 'object' ||
    Array.isArray(payload)
  ) {
    throw new Error(
      'The pending wishlist action is invalid.'
    );
  }

  const productId =
    payload.productId;

  const productName =
    payload.productName;

  if (
    typeof productId !== 'string' ||
    !productId.trim()
  ) {
    throw new Error(
      'The pending wishlist action has no product.'
    );
  }

  return {
    productId: productId.trim(),

    ...(typeof productName === 'string' &&
    productName.trim()
      ? {
          productName:
            productName.trim()
        }
      : {})
  };
}