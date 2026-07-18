import * as CartService from './cartService';

import type {
  AddToCartInput,
  CartItem,
  CartMutationResponse,
  UpdateCartQuantityInput
} from './cartTypes';

function requireWorkspaceId(
  workspaceId: string | null
): string {
  if (!workspaceId) {
    throw new Error(
      'A workspace is required for this cart operation.'
    );
  }

  return workspaceId;
}

export const DatabaseCart = {
  async get(
    workspaceId: string | null
  ): Promise<CartItem[]> {
    return CartService.getCart(
      requireWorkspaceId(workspaceId)
    );
  },

  async add(
    workspaceId: string | null,
    input: AddToCartInput
  ): Promise<CartMutationResponse> {
    const quantity = input.quantity ?? 1;

    if (quantity < 1) {
      throw new Error(
        'Cart quantity must be at least one.'
      );
    }

    return CartService.addCartItem({
      workspaceId:
        requireWorkspaceId(workspaceId),

      productId: input.product.id,
      variantId: input.variant.id,
      quantity
    });
  },

  async update(
    workspaceId: string | null,
    input: UpdateCartQuantityInput
  ): Promise<CartMutationResponse> {
    return CartService.updateCartItem(
      input.itemId,
      {
        workspaceId:
          requireWorkspaceId(workspaceId),

        quantity: input.quantity
      }
    );
  },

  async remove(
    workspaceId: string | null,
    itemId: string
  ): Promise<CartMutationResponse> {
    return CartService.removeCartItem(
      itemId,
      {
        workspaceId:
          requireWorkspaceId(workspaceId)
      }
    );
  },

  async clear(
    workspaceId: string | null
  ): Promise<CartMutationResponse> {
    return CartService.clearCart({
      workspaceId:
        requireWorkspaceId(workspaceId)
    });
  }
};