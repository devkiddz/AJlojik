import { DatabaseCart } from './databaseCart';
import { GuestCart } from './guestCart';

import type {
  AddToCartInput,
  CartItem,
  CartMutationResponse,
  CartRuntime,
  UpdateCartQuantityInput
} from './cartTypes';

function usesGuestCart(
  runtime: CartRuntime
): boolean {
  return (
    runtime.isGuest ||
    !runtime.workspaceId ||
    runtime.workspaceId === 'guest-live'
  );
}

export const CartEngine = {
  async get(
    runtime: CartRuntime
  ): Promise<CartItem[]> {
    if (usesGuestCart(runtime)) {
      return GuestCart.get();
    }

    return DatabaseCart.get(
      runtime.workspaceId
    );
  },

  async add(
    runtime: CartRuntime,
    input: AddToCartInput
  ): Promise<CartMutationResponse> {
    if (usesGuestCart(runtime)) {
      return GuestCart.add(input);
    }

    return DatabaseCart.add(
      runtime.workspaceId,
      input
    );
  },

  async update(
    runtime: CartRuntime,
    input: UpdateCartQuantityInput
  ): Promise<CartMutationResponse> {
    if (usesGuestCart(runtime)) {
      return GuestCart.update(input);
    }

    if (input.quantity <= 0) {
      return DatabaseCart.remove(
        runtime.workspaceId,
        input.itemId
      );
    }

    return DatabaseCart.update(
      runtime.workspaceId,
      input
    );
  },

  async remove(
    runtime: CartRuntime,
    itemId: string
  ): Promise<CartMutationResponse> {
    if (usesGuestCart(runtime)) {
      return GuestCart.remove(itemId);
    }

    return DatabaseCart.remove(
      runtime.workspaceId,
      itemId
    );
  },

  async clear(
    runtime: CartRuntime
  ): Promise<CartMutationResponse> {
    if (usesGuestCart(runtime)) {
      return GuestCart.clear();
    }

    return DatabaseCart.clear(
      runtime.workspaceId
    );
  }
};