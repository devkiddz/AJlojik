import type {
  Prisma
} from '@/lib/generated/prisma/client';

import { prisma } from '@/lib/prisma';

import type {
  CartItem,
  CartMutationResponse
} from '../cartTypes';

import {
  cartItemInclude,
  mapCartItem,
  mapCartItems
} from './cartMapper';

import { CartRouteError } from './cartValidation';

type TransactionClient = Prisma.TransactionClient;

async function getOrCreateCart(
  transaction: TransactionClient,
  userId: string,
  workspaceId: string
) {
  return transaction.cart.upsert({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId
      }
    },

    update: {},

    create: {
      workspaceId,
      userId
    }
  });
}

async function readCartItems(
  userId: string,
  workspaceId: string
): Promise<CartItem[]> {
  const cart = await prisma.cart.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId
      }
    },

    select: {
      id: true
    }
  });

  if (!cart) {
    return [];
  }

  const items = await prisma.cartItem.findMany({
    where: {
      cartId: cart.id
    },

    include: cartItemInclude,

    orderBy: {
      createdAt: 'asc'
    }
  });

  return mapCartItems(items);
}

function assertAvailableQuantity(
  requestedQuantity: number,
  inventory:
    | {
        quantity: number;
        reserved: number;
      }
    | null
): void {
  /*
   * Inventory enforcement begins only when an Inventory
   * record exists for the selected variant.
   */
  if (!inventory) {
    return;
  }

  const availableQuantity = Math.max(
    inventory.quantity - inventory.reserved,
    0
  );

  if (requestedQuantity > availableQuantity) {
    throw new CartRouteError(
      availableQuantity > 0
        ? `Only ${availableQuantity} item${
            availableQuantity === 1 ? '' : 's'
          } remain in stock.`
        : 'This product variant is currently out of stock.',
      409
    );
  }
}

export const CartRepository = {
  async get(
    userId: string,
    workspaceId: string
  ): Promise<CartItem[]> {
    return readCartItems(userId, workspaceId);
  },

  async add(
    userId: string,
    workspaceId: string,
    input: {
      productId: string;
      variantId: string;
      quantity: number;
    }
  ): Promise<CartMutationResponse> {
    const affectedItemId =
      await prisma.$transaction(
        async transaction => {
          const variant =
            await transaction.productVariant.findFirst({
              where: {
                id: input.variantId,
                productId: input.productId,
                active: true,

                product: {
                  active: true
                }
              },

              include: {
                inventory: true
              }
            });

          if (!variant) {
            throw new CartRouteError(
              'The selected product variant is unavailable.',
              404
            );
          }

          const cart = await getOrCreateCart(
            transaction,
            userId,
            workspaceId
          );

          const existingItem =
            await transaction.cartItem.findUnique({
              where: {
                cartId_variantId: {
                  cartId: cart.id,
                  variantId: input.variantId
                }
              },

              select: {
                id: true,
                quantity: true
              }
            });

          const nextQuantity =
            (existingItem?.quantity ?? 0) +
            input.quantity;

          assertAvailableQuantity(
            nextQuantity,
            variant.inventory
          );

          const affectedItem =
            await transaction.cartItem.upsert({
              where: {
                cartId_variantId: {
                  cartId: cart.id,
                  variantId: input.variantId
                }
              },

              update: {
                quantity: nextQuantity
              },

              create: {
                cartId: cart.id,
                productId: input.productId,
                variantId: input.variantId,
                quantity: input.quantity
              },

              select: {
                id: true
              }
            });

          return affectedItem.id;
        }
      );

    const items = await readCartItems(
      userId,
      workspaceId
    );

    return {
      items,

      affectedItem:
        items.find(
          item => item.id === affectedItemId
        ) ?? null
    };
  },

  async update(
    userId: string,
    workspaceId: string,
    input: {
      itemId: string;
      quantity: number;
    }
  ): Promise<CartMutationResponse> {
    if (input.quantity <= 0) {
      return CartRepository.remove(
        userId,
        workspaceId,
        input.itemId
      );
    }

    const affectedItemId =
      await prisma.$transaction(
        async transaction => {
          const existingItem =
            await transaction.cartItem.findFirst({
              where: {
                id: input.itemId,

                cart: {
                  userId,
                  workspaceId
                }
              },

              include: {
                variant: {
                  include: {
                    inventory: true
                  }
                }
              }
            });

          if (!existingItem) {
            throw new CartRouteError(
              'The selected cart item was not found.',
              404
            );
          }

          assertAvailableQuantity(
            input.quantity,
            existingItem.variant.inventory
          );

          const affectedItem =
            await transaction.cartItem.update({
              where: {
                id: existingItem.id
              },

              data: {
                quantity: input.quantity
              },

              select: {
                id: true
              }
            });

          return affectedItem.id;
        }
      );

    const items = await readCartItems(
      userId,
      workspaceId
    );

    return {
      items,

      affectedItem:
        items.find(
          item => item.id === affectedItemId
        ) ?? null
    };
  },

  async remove(
    userId: string,
    workspaceId: string,
    itemId: string
  ): Promise<CartMutationResponse> {
    const affectedItem =
      await prisma.$transaction(
        async transaction => {
          const record =
            await transaction.cartItem.findFirst({
              where: {
                id: itemId,

                cart: {
                  userId,
                  workspaceId
                }
              },

              include: cartItemInclude
            });

          if (!record) {
            throw new CartRouteError(
              'The selected cart item was not found.',
              404
            );
          }

          await transaction.cartItem.delete({
            where: {
              id: record.id
            }
          });

          return mapCartItem(record);
        }
      );

    const items = await readCartItems(
      userId,
      workspaceId
    );

    return {
      items,
      affectedItem
    };
  },

  async clear(
    userId: string,
    workspaceId: string
  ): Promise<CartMutationResponse> {
    await prisma.$transaction(
      async transaction => {
        const cart =
          await transaction.cart.findUnique({
            where: {
              workspaceId_userId: {
                workspaceId,
                userId
              }
            },

            select: {
              id: true
            }
          });

        if (!cart) {
          return;
        }

        await transaction.cartItem.deleteMany({
          where: {
            cartId: cart.id
          }
        });
      }
    );

    return {
      items: [],
      affectedItem: null
    };
  }
};