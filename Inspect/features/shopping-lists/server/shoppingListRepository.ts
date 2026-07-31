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

async function requeueApprovedPublication(
  userId: string,
  workspaceId: string,
  listId: string,
  reason: string
): Promise<void> {
  const list = await prisma.shoppingList.findFirst({
    where: {
      id: listId,
      userId,
      workspaceId,
      status: 'ACTIVE'
    },
    select: {
      id: true,
      name: true,
      visibility: true,
      publicationStatus: true
    }
  });

  if (!list || list.visibility !== 'SHARED' || list.publicationStatus !== 'APPROVED') {
    return;
  }

  await prisma.$transaction(async transaction => {
    await transaction.adminApprovalRequest.updateMany({
      where: {
        workspaceId,
        targetType: 'SHOPPING_LIST',
        targetId: listId,
        status: 'PENDING'
      },
      data: {
        status: 'CANCELLED',
        reviewNote: 'Replaced by a newer shopping-list revision.'
      }
    });

    await transaction.shoppingList.update({
      where: { id: listId },
      data: {
        publicationStatus: 'PENDING_REVIEW',
        publicationSubmittedAt: new Date(),
        publicationReviewedAt: null,
        publicationPublishedAt: null,
        publicationReviewNote: null
      }
    });

    const request = await transaction.adminApprovalRequest.create({
      data: {
        workspaceId,
        requestedById: userId,
        action: 'PUBLISH_LIVE',
        targetType: 'SHOPPING_LIST',
        targetId: listId,
        reason: `${list.name} changed after publication and requires a new review.`,
        payload: {
          source: 'CUSTOMER_SHOPPING_LIST',
          revisionReason: reason
        }
      }
    });

    await transaction.adminTodo.create({
      data: {
        workspaceId,
        title: 'Shopping list requires re-approval',
        description: `${list.name} changed after publication.`,
        source: 'APPROVAL',
        priority: 'MEDIUM',
        targetType: 'SHOPPING_LIST',
        targetId: listId
      }
    });

    await transaction.adminAuditEvent.create({
      data: {
        workspaceId,
        actorId: userId,
        action: 'SHOPPING_LIST_PUBLICATION_REQUEUED',
        targetType: 'SHOPPING_LIST',
        targetId: listId,
        summary: reason,
        metadata: {
          requestId: request.id
        }
      }
    });
  });
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

    if (input.status === 'ARCHIVED') {
      await prisma.$transaction([
        prisma.adminApprovalRequest.updateMany({
          where: {
            workspaceId,
            targetType: 'SHOPPING_LIST',
            targetId: listId,
            status: 'PENDING'
          },
          data: {
            status: 'CANCELLED',
            reviewNote: 'The customer archived this shopping list.'
          }
        }),
        prisma.shoppingList.update({
          where: { id: listId },
          data: {
            visibility: 'PRIVATE',
            publicationStatus: 'PRIVATE',
            publicationSubmittedAt: null,
            publicationReviewedAt: null,
            publicationPublishedAt: null,
            publicationReviewNote: null
          }
        })
      ]);
    } else {
      await requeueApprovedPublication(
        userId,
        workspaceId,
        listId,
        'The list title or description changed.'
      );
    }

    const refreshedList = await prisma.shoppingList.findUnique({
      where: { id: listId },
      include: shoppingListInclude
    });

    return {
      lists:
        await readLists(
          userId,
          workspaceId
        ),

      affectedList:
        refreshedList ? mapShoppingList(refreshedList) : mapShoppingList(list),

      affectedItem: null
    };
  },

  async submitPublication(
    userId: string,
    workspaceId: string,
    listId: string
  ): Promise<ShoppingListMutationResponse> {
    const ownedList = await prisma.shoppingList.findFirst({
      where: {
        id: listId,
        userId,
        workspaceId,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        description: true,
        publicationStatus: true,
        _count: {
          select: { items: true }
        }
      }
    });

    if (!ownedList) {
      throw new ShoppingListRouteError('The selected shopping list was not found.', 404);
    }

    if (ownedList._count.items === 0) {
      throw new ShoppingListRouteError('Add at least one product before submitting this list for publication.', 422);
    }

    if (ownedList.publicationStatus === 'PENDING_REVIEW') {
      throw new ShoppingListRouteError('This shopping list is already awaiting review.', 409);
    }

    await prisma.$transaction(async transaction => {
      await transaction.adminApprovalRequest.updateMany({
        where: {
          workspaceId,
          targetType: 'SHOPPING_LIST',
          targetId: listId,
          status: 'PENDING'
        },
        data: {
          status: 'CANCELLED',
          reviewNote: 'Replaced by a new customer publication request.'
        }
      });

      await transaction.shoppingList.update({
        where: { id: listId },
        data: {
          visibility: 'SHARED',
          publicationStatus: 'PENDING_REVIEW',
          publicationSubmittedAt: new Date(),
          publicationReviewedAt: null,
          publicationPublishedAt: null,
          publicationReviewNote: null
        }
      });

      const request = await transaction.adminApprovalRequest.create({
        data: {
          workspaceId,
          requestedById: userId,
          action: 'PUBLISH_LIVE',
          targetType: 'SHOPPING_LIST',
          targetId: listId,
          reason: `${ownedList.name} was shared publicly by its owner and requires Store approval.`,
          payload: {
            source: 'CUSTOMER_SHOPPING_LIST',
            listName: ownedList.name,
            description: ownedList.description,
            itemCount: ownedList._count.items
          }
        }
      });

      await transaction.adminTodo.create({
        data: {
          workspaceId,
          title: 'Review public shopping list',
          description: `${ownedList.name} contains ${ownedList._count.items} product${ownedList._count.items === 1 ? '' : 's'}.`,
          source: 'APPROVAL',
          priority: 'MEDIUM',
          targetType: 'SHOPPING_LIST',
          targetId: listId
        }
      });

      await transaction.adminAuditEvent.create({
        data: {
          workspaceId,
          actorId: userId,
          action: 'SHOPPING_LIST_PUBLICATION_SUBMITTED',
          targetType: 'SHOPPING_LIST',
          targetId: listId,
          summary: `${ownedList.name} was submitted for public Store approval.`,
          metadata: {
            requestId: request.id,
            itemCount: ownedList._count.items
          }
        }
      });
    });

    const affectedList = await prisma.shoppingList.findUnique({
      where: { id: listId },
      include: shoppingListInclude
    });

    return {
      lists: await readLists(userId, workspaceId),
      affectedList: affectedList ? mapShoppingList(affectedList) : null,
      affectedItem: null
    };
  },

  async withdrawPublication(
    userId: string,
    workspaceId: string,
    listId: string
  ): Promise<ShoppingListMutationResponse> {
    const ownedList = await prisma.shoppingList.findFirst({
      where: {
        id: listId,
        userId,
        workspaceId
      },
      select: {
        id: true,
        name: true
      }
    });

    if (!ownedList) {
      throw new ShoppingListRouteError('The selected shopping list was not found.', 404);
    }

    await prisma.$transaction(async transaction => {
      await transaction.adminApprovalRequest.updateMany({
        where: {
          workspaceId,
          targetType: 'SHOPPING_LIST',
          targetId: listId,
          status: 'PENDING'
        },
        data: {
          status: 'CANCELLED',
          reviewNote: 'The customer withdrew the list from public review.'
        }
      });

      await transaction.shoppingList.update({
        where: { id: listId },
        data: {
          visibility: 'PRIVATE',
          publicationStatus: 'PRIVATE',
          publicationSubmittedAt: null,
          publicationReviewedAt: null,
          publicationPublishedAt: null,
          publicationReviewNote: null
        }
      });

      await transaction.adminAuditEvent.create({
        data: {
          workspaceId,
          actorId: userId,
          action: 'SHOPPING_LIST_PUBLICATION_WITHDRAWN',
          targetType: 'SHOPPING_LIST',
          targetId: listId,
          summary: `${ownedList.name} was returned to private visibility.`
        }
      });
    });

    const affectedList = await prisma.shoppingList.findUnique({
      where: { id: listId },
      include: shoppingListInclude
    });

    return {
      lists: await readLists(userId, workspaceId),
      affectedList: affectedList ? mapShoppingList(affectedList) : null,
      affectedItem: null
    };
  },

  async getApprovedPublic(
    workspaceId: string,
    take = 12
  ): Promise<ShoppingList[]> {
    const lists = await prisma.shoppingList.findMany({
      where: {
        workspaceId,
        status: 'ACTIVE',
        visibility: 'SHARED',
        publicationStatus: 'APPROVED'
      },
      include: shoppingListInclude,
      orderBy: [
        { publicationPublishedAt: 'desc' },
        { updatedAt: 'desc' }
      ],
      take
    });

    return mapShoppingLists(lists);
  },

  async getApprovedPublicById(
    listId: string
  ): Promise<ShoppingList | null> {
    const list = await prisma.shoppingList.findFirst({
      where: {
        id: listId,
        status: 'ACTIVE',
        visibility: 'SHARED',
        publicationStatus: 'APPROVED'
      },
      include: shoppingListInclude
    });

    return list ? mapShoppingList(list) : null;
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

    await requeueApprovedPublication(
      userId,
      workspaceId,
      listId,
      'A product was added or its planned quantity changed.'
    );

    const affectedListRecord = await prisma.shoppingList.findUnique({
      where: { id: listId },
      include: shoppingListInclude
    });

    return {
      lists:
        await readLists(
          userId,
          workspaceId
        ),

      affectedList:
        affectedListRecord ? mapShoppingList(affectedListRecord) : null,

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

    await requeueApprovedPublication(
      userId,
      workspaceId,
      listId,
      'A planned product quantity or note changed.'
    );

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

    await requeueApprovedPublication(
      userId,
      workspaceId,
      listId,
      'A product was removed from the shopping list.'
    );

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