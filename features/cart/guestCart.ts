import type {
  AddToCartInput,
  CartItem,
  CartMutationResponse,
  UpdateCartQuantityInput
} from './cartTypes';

import {
  clearGuestCartStorage,
  readGuestCartStorage,
  writeGuestCartStorage
} from './utils/cartStorage';

function createGuestCartItem(
  input: Required<AddToCartInput>
): CartItem {
  const now = new Date().toISOString();

  return {
    id: `guest-cart:${input.variant.id}`,
    productId: input.product.id,
    variantId: input.variant.id,

    product: input.product,
    variant: input.variant,

    quantity: input.quantity,

    createdAt: now,
    updatedAt: now
  };
}

export const GuestCart = {
  async get(): Promise<CartItem[]> {
    return readGuestCartStorage();
  },

  async add(
    input: AddToCartInput
  ): Promise<CartMutationResponse> {
    const quantity = input.quantity ?? 1;

    if (quantity < 1) {
      throw new Error(
        'Cart quantity must be at least one.'
      );
    }

    const items = readGuestCartStorage();

    const existingItem = items.find(
      item => item.variantId === input.variant.id
    );

    let affectedItem: CartItem;

    if (existingItem) {
      affectedItem = {
        ...existingItem,
        product: input.product,
        variant: input.variant,
        quantity:
          existingItem.quantity + quantity,
        updatedAt: new Date().toISOString()
      };
    } else {
      affectedItem = createGuestCartItem({
        ...input,
        quantity
      });
    }

    const nextItems = existingItem
      ? items.map(item =>
          item.id === existingItem.id
            ? affectedItem
            : item
        )
      : [...items, affectedItem];

    writeGuestCartStorage(nextItems);

    return {
      items: nextItems,
      affectedItem
    };
  },

  async update(
    input: UpdateCartQuantityInput
  ): Promise<CartMutationResponse> {
    if (input.quantity <= 0) {
      return GuestCart.remove(input.itemId);
    }

    const items = readGuestCartStorage();

    let affectedItem: CartItem | null = null;

    const nextItems = items.map(item => {
      if (item.id !== input.itemId) {
        return item;
      }

      affectedItem = {
        ...item,
        quantity: input.quantity,
        updatedAt: new Date().toISOString()
      };

      return affectedItem;
    });

    writeGuestCartStorage(nextItems);

    return {
      items: nextItems,
      affectedItem
    };
  },

  async remove(
    itemId: string
  ): Promise<CartMutationResponse> {
    const items = readGuestCartStorage();

    const affectedItem =
      items.find(item => item.id === itemId) ??
      null;

    const nextItems = items.filter(
      item => item.id !== itemId
    );

    writeGuestCartStorage(nextItems);

    return {
      items: nextItems,
      affectedItem
    };
  },

  async clear(): Promise<CartMutationResponse> {
    clearGuestCartStorage();

    return {
      items: [],
      affectedItem: null
    };
  }
};