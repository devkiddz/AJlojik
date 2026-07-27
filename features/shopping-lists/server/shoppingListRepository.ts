import {
  prisma
} from '@/lib/prisma';

import type {
  ShoppingList,
  ShoppingListMutationResponse
} from '../shoppingListTypes';

import {
  mapShoppingList,
  mapShoppingListItem,
  mapShoppingLists,
  shoppingListInclude
} from './shoppingListMapper';

import {
  ShoppingListRouteError
} from './shoppingListValidation';

async function readLists(
  userId: string,
  workspaceId: string
): Promise<ShoppingList[]> {
  const lists =
    await prisma.shoppingList.findMany({
      where: {
        userId,
        workspaceId,
        status: 'ACTIVE'
      },

      include:
        shoppingListInclude,

      orderBy: [
        {
          position: 'asc'
        },
        {
          updatedAt: 'desc'
        }
      ]
    });

  return mapShoppingLists(
    lists
  );
}

async function requireOwnedList(
  userId: string,
  workspaceId: string,
  listId: string
) {
  const list =
    await prisma.shoppingList.findFirst({
      where: {
        id: listId,
        userId,
        workspaceId
      },

      select: {
        id: true
      }
    });

  if (!list) {
    throw new ShoppingListRouteError(
      'The selected shopping list was not found.',
      404
    );
  }

  return list;
}

export const ShoppingListRepository = {
  async get(
    userId: string,
    workspaceId: string
  ): Promise<ShoppingList[]> {
    return readLists(
      userId,
      workspaceId
    );
  },

  async create(
    userId: string,
    workspaceId: string,
    input: {
      name: string;
      description?: string;
    }
  ): Promise<ShoppingListMutationResponse> {
    const existingList =
      await prisma.shoppingList.findFirst({
        where: {
          userId,
          workspaceId,
          name: {
            equals:
              input.name,
            mode:
              'insensitive'
          },
          status: 'ACTIVE'
        },

        select: {
          id: true
        }
      });

    if (existingList) {
      throw new ShoppingListRouteError(
        'A shopping list with this name already exists.',
        409
      );
    }

    const positionAggregate =
      await prisma.shoppingList.aggregate({
        where: {
          userId,
          workspaceId,
          status: 'ACTIVE'
        },

        _max: {
          position: true
        }
      });

    const list =
      await prisma.shoppingList.create({
        data: {
          userId,
          workspaceId,

          name:
            input.name,

          description:
            input.description ||
            null,

          position:
            (
              positionAggregate
                ._max.position ??
              -1
            ) + 1
        },

        include:
          shoppingListInclude
      });

    const lists =
      await readLists(
        userId,
        workspaceId
      );

    return {
      lists,
      affectedList:
        mapShoppingList(list),
      affectedItem: null
    };
  },

  async update(
    userId: string,
    workspaceId: string,
    listId: string,
    input: {
      name?: string;
      description?:
        string | null;
      visibility?:
        'PRIVATE' | 'SHARED';
      status?:
        'ACTIVE' | 'ARCHIVED';
    }
  ): Promise<ShoppingListMutationResponse> {
    await requireOwnedList(
      userId,
      workspaceId,
      listId
    );

    if (input.name) {
      const conflict =
        await prisma.shoppingList.findFirst({
          where: {
            userId,
            workspaceId,

            id: {
              not: listId
            },

            name: {
              equals:
                input.name,
              mode:
                'insensitive'
            },

            status: 'ACTIVE'
          },

          select: {
            id: true
          }
        });

      if (conflict) {
        throw new ShoppingListRouteError(
          'Another shopping list already uses this name.',
          409
        );
      }
    }

    const list =
      await prisma.shoppingList.update({
        where: {
          id: listId
        },

        data: {
          ...(input.name !==
          undefined
            ? {
                name:
                  input.name
              }
            : {}),

          ...(input.description !==
          undefined
            ? {
                description:
                  input.description
              }
            : {}),

          ...(input.visibility !==
          undefined
            ? {
                visibility:
                  input.visibility
              }
            : {}),

          ...(input.status !==
          undefined
            ? {
                status:
                  input.status
              }
            : {})
        },

        include:
          shoppingListInclude
      });

    return {
      lists:
        await readLists(
          userId,
          workspaceId
        ),

      affectedList:
        mapShoppingList(list),

      affectedItem: null
    };
  },

  async addItem(
    userId: string,
    workspaceId: string,
    listId: string,
    input: {
      productId: string;
      variantId:
        string | null;
      quantity: number;
      note?: string;
    }
  ): Promise<ShoppingListMutationResponse> {
    await requireOwnedList(
      userId,
      workspaceId,
      listId
    );

    const product =
      await prisma.product.findFirst({
        where: {
          id:
            input.productId,

          workspaceId,
          active: true
        },

        select: {
          id: true,

          variants: {
            where: {
              active: true
            },

            select: {
              id: true
            }
          }
        }
      });

    if (!product) {
      throw new ShoppingListRouteError(
        'The selected product is unavailable.',
        404
      );
    }

    if (
      input.variantId &&
      !product.variants.some(
        variant =>
          variant.id ===
          input.variantId
      )
    ) {
      throw new ShoppingListRouteError(
        'The selected product variant is unavailable.',
        404
      );
    }

    const affectedItemId =
      await prisma.$transaction(
        async transaction => {
          const existingItem =
            await transaction.shoppingListItem.findUnique({
              where: {
                shoppingListId_productId: {
                  shoppingListId:
                    listId,

                  productId:
                    input.productId
                }
              },

              select: {
                id: true,
                quantity: true
              }
            });

          if (existingItem) {
            const updated =
              await transaction.shoppingListItem.update({
                where: {
                  id:
                    existingItem.id
                },

                data: {
                  quantity:
                    existingItem.quantity +
                    input.quantity,

                  variantId:
                    input.variantId,

                  ...(input.note !==
                  undefined
                    ? {
                        note:
                          input.note ||
                          null
                      }
                    : {})
                },

                select: {
                  id: true
                }
              });

            return updated.id;
          }

          const positionAggregate =
            await transaction.shoppingListItem.aggregate({
              where: {
                shoppingListId:
                  listId
              },

              _max: {
                position: true
              }
            });

          const created =
            await transaction.shoppingListItem.create({
              data: {
                shoppingListId:
                  listId,

                productId:
                  input.productId,

                variantId:
                  input.variantId,

                quantity:
                  input.quantity,

                note:
                  input.note ||
                  null,

                position:
                  (
                    positionAggregate
                      ._max.position ??
                    -1
                  ) + 1
              },

              select: {
                id: true
              }
            });

          return created.id;
        }
      );

    const affectedRecord =
      await prisma.shoppingListItem.findUnique({
        where: {
          id:
            affectedItemId
        },

        include:
          shoppingListInclude
            .items.include
      });

    return {
      lists:
        await readLists(
          userId,
          workspaceId
        ),

      affectedList:
        null,

      affectedItem:
        affectedRecord
          ? mapShoppingListItem(
              affectedRecord
            )
          : null
    };
  },

  async updateItem(
    userId: string,
    workspaceId: string,
    listId: string,
    itemId: string,
    input: {
      quantity?: number;
      note?: string | null;
      position?: number;
    }
  ): Promise<ShoppingListMutationResponse> {
    await requireOwnedList(
      userId,
      workspaceId,
      listId
    );

    const item =
      await prisma.shoppingListItem.findFirst({
        where: {
          id: itemId,
          shoppingListId:
            listId
        },

        select: {
          id: true
        }
      });

    if (!item) {
      throw new ShoppingListRouteError(
        'The selected shopping list item was not found.',
        404
      );
    }

    const updated =
      await prisma.shoppingListItem.update({
        where: {
          id: item.id
        },

        data: {
          ...(input.quantity !==
          undefined
            ? {
                quantity:
                  input.quantity
              }
            : {}),

          ...(input.note !==
          undefined
            ? {
                note:
                  input.note
              }
            : {}),

          ...(input.position !==
          undefined
            ? {
                position:
                  input.position
              }
            : {})
        },

        include:
          shoppingListInclude
            .items.include
      });

    return {
      lists:
        await readLists(
          userId,
          workspaceId
        ),

      affectedList:
        null,

      affectedItem:
        mapShoppingListItem(
          updated
        )
    };
  },

  async removeItem(
    userId: string,
    workspaceId: string,
    listId: string,
    itemId: string
  ): Promise<ShoppingListMutationResponse> {
    await requireOwnedList(
      userId,
      workspaceId,
      listId
    );

    const item =
      await prisma.shoppingListItem.findFirst({
        where: {
          id: itemId,
          shoppingListId:
            listId
        },

        include:
          shoppingListInclude
            .items.include
      });

    if (!item) {
      throw new ShoppingListRouteError(
        'The selected shopping list item was not found.',
        404
      );
    }

    await prisma.shoppingListItem.delete({
      where: {
        id: item.id
      }
    });

    return {
      lists:
        await readLists(
          userId,
          workspaceId
        ),

      affectedList:
        null,

      affectedItem:
        mapShoppingListItem(
          item
        )
    };
  }
};