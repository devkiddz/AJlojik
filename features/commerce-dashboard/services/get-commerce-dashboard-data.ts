import { prisma } from '@/lib/prisma';

import type { Workspace } from '@/features/workspace';

import type {
  CommerceCartItem,
  CommerceDashboardData,
  CommerceHistoryEntry,
  CommerceOrder,
  CommerceProduct
} from '../contracts/commerceDashboardTypes';

type DashboardProductRecord = {
  id: string;
  slug: string;
  name: string;

  rating: number;
  soldCount: number;

  featured: boolean;
  isNew: boolean;

  category: {
    slug: string;
  };

  brand: {
    slug: string;
  } | null;

  images: {
    url: string;
    primary: boolean;
    position: number;
  }[];

  variants: {
    id: string;
    label: string;

    image: string | null;

    price: unknown;
    compareAtPrice: unknown;

    active: boolean;
    position: number;

    inventory: {
      quantity: number;
      reserved: number;
    } | null;
  }[];
};

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return Array.from(
    new Set(
      values.filter(
        (value): value is string =>
          typeof value === 'string' && value.length > 0
      )
    )
  );
}

function extractShoppingListProductIds(
  value: unknown
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const productIds = value.flatMap(
    (item: unknown): string[] => {
      if (
        !item ||
        typeof item !== 'object' ||
        !('productIds' in item)
      ) {
        return [];
      }

      const rawProductIds = (
        item as {
          productIds?: unknown;
        }
      ).productIds;

      if (!Array.isArray(rawProductIds)) {
        return [];
      }

      return rawProductIds.filter(
        (
          productId: unknown
        ): productId is string =>
          typeof productId === 'string'
      );
    }
  );

  return uniqueStrings(productIds);
}

function mapProduct(
  product: DashboardProductRecord
): CommerceProduct {
  const activeVariants = product.variants
    .filter(variant => variant.active)
    .sort(
      (first, second) =>
        first.position - second.position
    );

  const availableVariant =
    activeVariants.find(variant => {
      const available =
        (variant.inventory?.quantity ?? 0) -
        (variant.inventory?.reserved ?? 0);

      return available > 0;
    }) ??
    activeVariants[0] ??
    null;

  const stockLeft = availableVariant
    ? Math.max(
        (availableVariant.inventory?.quantity ?? 0) -
          (availableVariant.inventory?.reserved ?? 0),
        0
      )
    : 0;

  const primaryImage =
    product.images.find(image => image.primary) ??
    product.images[0] ??
    null;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,

    categorySlug: product.category.slug,
    brandSlug: product.brand?.slug ?? null,

    image:
      availableVariant?.image ??
      primaryImage?.url ??
      null,

    price: availableVariant
      ? Number(availableVariant.price)
      : 0,

    compareAtPrice:
      availableVariant?.compareAtPrice == null
        ? null
        : Number(availableVariant.compareAtPrice),

    available: stockLeft > 0,
    stockLeft,

    rating: product.rating,
    soldCount: product.soldCount,

    featured: product.featured,
    isNew: product.isNew
  };
}

function createProductMap(
  products: CommerceProduct[]
): Map<string, CommerceProduct> {
  return new Map(
    products.map(product => [product.id, product])
  );
}

export async function getCommerceDashboardData(
  userId: string,
  workspace: Workspace
): Promise<CommerceDashboardData> {
  const [
    customer,
    orders,
    cart,
    wishlist,
    scopedProductViews,
    recentViews,
    reviews,
    history,
    deliveredOrderProducts,
    paidOrderAggregate,
    activeOrderCount,
    deliveredOrderCount
  ] = await Promise.all([
    prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        tier: true,
        emailVerified: true,
        createdAt: true,

        experienceProfile: {
          select: {
            persona: true,

            personalizationEnabled: true,
            onboardingCompleted: true,

            preferredCategorySlugs: true,
            preferredBrandSlugs: true,
            recentlyViewedProductIds: true,

            recommendationScore: true,
            engagementScore: true,
            commerceScore: true,

            shoppingLists: true
          }
        }
      }
    }),

    prisma.order.findMany({
      where: {
        userId,
        workspaceId: workspace.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 12,
      select: {
        id: true,
        orderNumber: true,

        status: true,
        paymentStatus: true,

        subtotal: true,
        discountAmount: true,
        deliveryFee: true,
        total: true,

        createdAt: true,

        items: {
          orderBy: {
            createdAt: 'asc'
          },
          select: {
            id: true,

            productId: true,
            productName: true,
            variantLabel: true,
            image: true,

            quantity: true,
            unitPrice: true,
            totalPrice: true,

            product: {
              select: {
                slug: true
              }
            }
          }
        },

        payments: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          select: {
            reference: true,
            paidAt: true
          }
        },

        delivery: {
          select: {
            method: true,
            status: true,

            trackingCode: true,
            trackingEnabled: true,

            estimatedArrival: true,
            pickedUpAt: true,
            deliveredAt: true,

            events: {
              orderBy: {
                createdAt: 'desc'
              },
              take: 5,
              select: {
                status: true,
                note: true,
                createdAt: true
              }
            }
          }
        }
      }
    }),

    prisma.cart.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: workspace.id,
          userId
        }
      },
      select: {
        items: {
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            quantity: true,

            variantId: true,

            variant: {
              select: {
                label: true,
                price: true
              }
            },

            product: {
              select: {
                id: true
              }
            }
          }
        }
      }
    }),

    prisma.wishlist.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: workspace.id,
          userId
        }
      },
      select: {
        items: {
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            productId: true
          }
        }
      }
    }),

    prisma.experienceEvent.findMany({
      where: {
        workspaceId: workspace.id,
        userId,
        type: 'PRODUCT_VIEW',
        productId: {
          not: null
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 16,
      select: {
        productId: true
      }
    }),

    prisma.recentlyViewed.findMany({
      where: {
        userId
      },
      orderBy: {
        viewedAt: 'desc'
      },
      take: 16,
      select: {
        productId: true
      }
    }),

    prisma.review.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        productId: true
      }
    }),

    prisma.experienceHistoryEntry.findMany({
      where: {
        workspaceId: workspace.id,
        userId,
        OR: [
          {
            expiresAt: null
          },
          {
            expiresAt: {
              gt: new Date()
            }
          }
        ]
      },
      orderBy: {
        visitedAt: 'desc'
      },
      take: 10,
      select: {
        id: true,

        label: true,
        subtitle: true,

        categorySlug: true,
        source: true,

        productId: true,
        collectionId: true,
        campaignId: true,

        visitedAt: true
      }
    }),

    prisma.orderItem.findMany({
      where: {
        order: {
          userId,
          workspaceId: workspace.id,
          status: 'DELIVERED'
        }
      },
      distinct: ['productId'],
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        productId: true
      }
    }),

    prisma.order.aggregate({
      where: {
        userId,
        workspaceId: workspace.id,
        paymentStatus: 'PAID',
        status: {
          notIn: ['CANCELLED', 'REFUNDED']
        }
      },
      _count: {
        _all: true
      },
      _sum: {
        total: true
      }
    }),

    prisma.order.count({
      where: {
        userId,
        workspaceId: workspace.id,
        status: {
          in: [
            'PENDING',
            'CONFIRMED',
            'PROCESSING',
            'READY',
            'DISPATCHED'
          ]
        }
      }
    }),

    prisma.order.count({
      where: {
        userId,
        workspaceId: workspace.id,
        status: 'DELIVERED'
      }
    })
  ]);

  if (!customer) {
    throw new Error(
      'The authenticated customer could not be loaded.'
    );
  }

  const profile = customer.experienceProfile;

  const shoppingListProductIds =
    extractShoppingListProductIds(
      profile?.shoppingLists
    );

  const cartItemsRaw = cart?.items ?? [];
  const wishlistProductIds =
    wishlist?.items.map(item => item.productId) ??
    [];

  const scopedRecentProductIds = uniqueStrings(
    scopedProductViews.map(item => item.productId)
  );

  const fallbackRecentProductIds = uniqueStrings([
    ...recentViews.map(item => item.productId),
    ...(profile?.recentlyViewedProductIds ?? [])
  ]);

  const recentProductIds = uniqueStrings([
    ...scopedRecentProductIds,
    ...fallbackRecentProductIds
  ]).slice(0, 12);

  const reviewedProductIds = new Set(
    reviews.map(review => review.productId)
  );

  const pendingReviewProductIds =
    deliveredOrderProducts
      .map(item => item.productId)
      .filter(
        productId =>
          !reviewedProductIds.has(productId)
      );

  const requiredProductIds = uniqueStrings([
    ...cartItemsRaw.map(
      item => item.product.id
    ),
    ...wishlistProductIds,
    ...recentProductIds,
    ...shoppingListProductIds,
    ...pendingReviewProductIds
  ]);

  const [requiredProductRecords, catalogRecords] =
    await Promise.all([
      requiredProductIds.length
        ? prisma.product.findMany({
            where: {
              id: {
                in: requiredProductIds
              },
              active: true
            },
            select: {
              id: true,
              slug: true,
              name: true,

              rating: true,
              soldCount: true,

              featured: true,
              isNew: true,

              category: {
                select: {
                  slug: true
                }
              },

              brand: {
                select: {
                  slug: true
                }
              },

              images: {
                orderBy: [
                  {
                    primary: 'desc'
                  },
                  {
                    position: 'asc'
                  }
                ],
                select: {
                  url: true,
                  primary: true,
                  position: true
                }
              },

              variants: {
                where: {
                  active: true
                },
                orderBy: {
                  position: 'asc'
                },
                select: {
                  id: true,
                  label: true,

                  image: true,

                  price: true,
                  compareAtPrice: true,

                  active: true,
                  position: true,

                  inventory: {
                    select: {
                      quantity: true,
                      reserved: true
                    }
                  }
                }
              }
            }
          })
        : Promise.resolve([]),

      prisma.product.findMany({
        where: {
          active: true,
          variants: {
            some: {
              active: true
            }
          }
        },
        orderBy: [
          {
            featured: 'desc'
          },
          {
            soldCount: 'desc'
          },
          {
            rating: 'desc'
          },
          {
            createdAt: 'desc'
          }
        ],
        take: 48,
        select: {
          id: true,
          slug: true,
          name: true,

          rating: true,
          soldCount: true,

          featured: true,
          isNew: true,

          category: {
            select: {
              slug: true
            }
          },

          brand: {
            select: {
              slug: true
            }
          },

          images: {
            orderBy: [
              {
                primary: 'desc'
              },
              {
                position: 'asc'
              }
            ],
            select: {
              url: true,
              primary: true,
              position: true
            }
          },

          variants: {
            where: {
              active: true
            },
            orderBy: {
              position: 'asc'
            },
            select: {
              id: true,
              label: true,

              image: true,

              price: true,
              compareAtPrice: true,

              active: true,
              position: true,

              inventory: {
                select: {
                  quantity: true,
                  reserved: true
                }
              }
            }
          }
        }
      })
    ]);

  const allProducts = Array.from(
    new Map(
      [
        ...requiredProductRecords,
        ...catalogRecords
      ].map(record => [record.id, mapProduct(record)])
    ).values()
  );

  const productById =
    createProductMap(allProducts);

  const cartItems: CommerceCartItem[] =
    cartItemsRaw.flatMap(item => {
      const product =
        productById.get(item.product.id);

      if (!product) {
        return [];
      }

      const unitPrice = Number(
        item.variant.price
      );

      return [
        {
          id: item.id,

          product,

          variantId: item.variantId,
          variantLabel: item.variant.label,

          quantity: item.quantity,
          unitPrice,
          lineTotal:
            unitPrice * item.quantity
        }
      ];
    });

  const mapProductIds = (
    productIds: string[]
  ): CommerceProduct[] =>
    productIds
      .map(productId =>
        productById.get(productId)
      )
      .filter(
        (
          product
        ): product is CommerceProduct =>
          Boolean(product)
      );

  const mappedOrders: CommerceOrder[] =
    orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,

      status: order.status,
      paymentStatus: order.paymentStatus,

      subtotal: Number(order.subtotal),
      discountAmount: Number(
        order.discountAmount
      ),
      deliveryFee: Number(
        order.deliveryFee
      ),
      total: Number(order.total),

      createdAt:
        order.createdAt.toISOString(),

      items: order.items.map(item => ({
        id: item.id,

        productId: item.productId,
        productSlug: item.product.slug,

        productName: item.productName,
        variantLabel: item.variantLabel,

        image: item.image,

        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(
          item.totalPrice
        )
      })),

      paymentReference:
        order.payments[0]?.reference ??
        null,

      paidAt:
        order.payments[0]?.paidAt?.toISOString() ??
        null,

      delivery: order.delivery
        ? {
            method: order.delivery.method,
            status: order.delivery.status,

            trackingCode:
              order.delivery.trackingCode,

            trackingEnabled:
              order.delivery.trackingEnabled,

            estimatedArrival:
              order.delivery.estimatedArrival?.toISOString() ??
              null,

            pickedUpAt:
              order.delivery.pickedUpAt?.toISOString() ??
              null,

            deliveredAt:
              order.delivery.deliveredAt?.toISOString() ??
              null,

            events:
              order.delivery.events.map(
                event => ({
                  status: event.status,
                  note: event.note,
                  createdAt:
                    event.createdAt.toISOString()
                })
              )
          }
        : null
    }));

  const mappedHistory:
    CommerceHistoryEntry[] =
    history.map(entry => ({
      id: entry.id,

      label: entry.label,
      subtitle: entry.subtitle,

      categorySlug: entry.categorySlug,

      source: entry.source,

      productId: entry.productId,
      collectionId: entry.collectionId,
      campaignId: entry.campaignId,

      visitedAt:
        entry.visitedAt.toISOString()
    }));

  const cartQuantity = cartItems.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  const cartSubtotal = cartItems.reduce(
    (total, item) =>
      total + item.lineTotal,
    0
  );

  const firstName =
    customer.name.trim().split(/\s+/)[0] ||
    customer.name;

  return {
    generatedAt: new Date().toISOString(),

    identity: {
      id: customer.id,

      name: customer.name,
      firstName,

      email: customer.email,
      image: customer.image,

      tier: customer.tier ?? 'member',
      emailVerified:
        customer.emailVerified,

      memberSince:
        customer.createdAt.toISOString()
    },

    workspace: {
      id: workspace.id,
      slug: workspace.slug,
      name: workspace.name,

      mode: workspace.mode,
      role: workspace.membership.role,

      wallet: workspace.wallet
    },

    profile: {
      persona:
        profile?.persona ?? 'new-member',

      personalizationEnabled:
        profile?.personalizationEnabled ??
        true,

      onboardingCompleted:
        profile?.onboardingCompleted ??
        false,

      preferredCategorySlugs:
        profile?.preferredCategorySlugs ??
        [],

      preferredBrandSlugs:
        profile?.preferredBrandSlugs ??
        [],

      recommendationScore:
        profile?.recommendationScore ?? 0,

      engagementScore:
        profile?.engagementScore ?? 0,

      commerceScore:
        profile?.commerceScore ?? 0,

      shoppingListProductIds
    },

    pulse: {
      paidOrderCount:
        paidOrderAggregate._count._all,

      activeOrderCount,
      deliveredOrderCount,

      totalSpent: Number(
        paidOrderAggregate._sum.total ?? 0
      ),

      cartQuantity,
      cartSubtotal,

      wishlistCount:
        wishlistProductIds.length,

      reviewCount: reviews.length,

      pendingReviewCount:
        pendingReviewProductIds.length
    },

    cartItems,

    wishlistProducts:
      mapProductIds(
        wishlistProductIds
      ),

    recentProducts:
      mapProductIds(
        recentProductIds
      ),

    shoppingListProducts:
      mapProductIds(
        shoppingListProductIds
      ),

    pendingReviewProducts:
      mapProductIds(
        pendingReviewProductIds
      ),

    orders: mappedOrders,
    history: mappedHistory,

    catalog: allProducts
  };
}
