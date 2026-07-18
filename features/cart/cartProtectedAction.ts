import type {
  AddToCartInput
} from './cartTypes';

export const CART_ADD_ACTION =
  'cart.add';

export type CartAddActionPayload = {
  productId: string;
  variantId: string;

  quantity: number;

  productName?: string;
  variantLabel?: string;
};

export function createCartAddActionPayload(
  input: AddToCartInput
): CartAddActionPayload {
  const quantity =
    input.quantity ?? 1;

  return {
    productId: String(
      input.product.id
    ),

    variantId: String(
      input.variant.id
    ),

    quantity,

    ...(input.product.name
      ? {
          productName:
            input.product.name
        }
      : {}),

    ...(input.variant.label
      ? {
          variantLabel:
            input.variant.label
        }
      : {})
  };
}

export function parseCartAddActionPayload(
  payload: unknown
): CartAddActionPayload {
  if (
    !payload ||
    typeof payload !== 'object' ||
    Array.isArray(payload)
  ) {
    throw new Error(
      'The pending cart action is invalid.'
    );
  }

  const candidate =
    payload as Partial<CartAddActionPayload>;

  if (
    typeof candidate.productId !==
      'string' ||
    !candidate.productId.trim()
  ) {
    throw new Error(
      'The pending cart action has no product.'
    );
  }

  if (
    typeof candidate.variantId !==
      'string' ||
    !candidate.variantId.trim()
  ) {
    throw new Error(
      'The pending cart action has no product option.'
    );
  }

  const quantity =
    typeof candidate.quantity ===
      'number' &&
    Number.isFinite(candidate.quantity)
      ? Math.floor(candidate.quantity)
      : 1;

  if (quantity < 1) {
    throw new Error(
      'Cart quantity must be at least one.'
    );
  }

  return {
    productId:
      candidate.productId.trim(),

    variantId:
      candidate.variantId.trim(),

    quantity,

    ...(typeof candidate.productName ===
      'string' &&
    candidate.productName.trim()
      ? {
          productName:
            candidate.productName.trim()
        }
      : {}),

    ...(typeof candidate.variantLabel ===
      'string' &&
    candidate.variantLabel.trim()
      ? {
          variantLabel:
            candidate.variantLabel.trim()
        }
      : {})
  };
}