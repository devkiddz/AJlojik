import type { PrismaClient } from '../../lib/generated/prisma/client';

import type { SeededWorkspaces } from './workspace.seed';

export async function seedCommerce(
  prisma: PrismaClient,
  workspaces: SeededWorkspaces
) {
  console.log('Seeding demo and practice commerce...');

  const users = await prisma.user.findMany({
    select: {
      id: true
    }
  });

  const products = await prisma.product.findMany({
    take: 6,
    orderBy: {
      createdAt: 'asc'
    },
    include: {
      variants: {
        where: {
          active: true
        },
        orderBy: {
          position: 'asc'
        },
        take: 1
      },
      images: {
        orderBy: {
          position: 'asc'
        },
        take: 1
      }
    }
  });

  if (products.length < 4) {
    throw new Error(
      'At least four seeded products are required for commerce seeding.'
    );
  }

  let demoCarts = 0;
  let practiceCarts = 0;
  let wishlists = 0;
  let orders = 0;
  let payments = 0;

  for (const user of users) {
    const demoCart = await prisma.cart.upsert({
      where: {
        workspaceId_userId: {
          workspaceId: workspaces.demo.id,
          userId: user.id
        }
      },
      update: {},
      create: {
        workspaceId: workspaces.demo.id,
        userId: user.id
      }
    });

    demoCarts += 1;

    const practiceCart = await prisma.cart.upsert({
      where: {
        workspaceId_userId: {
          workspaceId: workspaces.practice.id,
          userId: user.id
        }
      },
      update: {},
      create: {
        workspaceId: workspaces.practice.id,
        userId: user.id
      }
    });

    practiceCarts += 1;

    const demoWishlist = await prisma.wishlist.upsert({
      where: {
        workspaceId_userId: {
          workspaceId: workspaces.demo.id,
          userId: user.id
        }
      },
      update: {},
      create: {
        workspaceId: workspaces.demo.id,
        userId: user.id
      }
    });

    const practiceWishlist = await prisma.wishlist.upsert({
      where: {
        workspaceId_userId: {
          workspaceId: workspaces.practice.id,
          userId: user.id
        }
      },
      update: {},
      create: {
        workspaceId: workspaces.practice.id,
        userId: user.id
      }
    });

    wishlists += 2;

    const demoCartProducts = products.slice(0, 2);
    const practiceCartProducts = products.slice(2, 4);

    for (const [index, product] of demoCartProducts.entries()) {
      const variant = product.variants[0];

      if (!variant) continue;

      await prisma.cartItem.upsert({
        where: {
          cartId_variantId: {
            cartId: demoCart.id,
            variantId: variant.id
          }
        },
        update: {
          quantity: index + 1
        },
        create: {
          cartId: demoCart.id,
          productId: product.id,
          variantId: variant.id,
          quantity: index + 1
        }
      });
    }

    for (const product of practiceCartProducts) {
      const variant = product.variants[0];

      if (!variant) continue;

      await prisma.cartItem.upsert({
        where: {
          cartId_variantId: {
            cartId: practiceCart.id,
            variantId: variant.id
          }
        },
        update: {
          quantity: 1
        },
        create: {
          cartId: practiceCart.id,
          productId: product.id,
          variantId: variant.id,
          quantity: 1
        }
      });
    }

    for (const product of products.slice(1, 4)) {
      await prisma.wishlistItem.upsert({
        where: {
          wishlistId_productId: {
            wishlistId: demoWishlist.id,
            productId: product.id
          }
        },
        update: {},
        create: {
          wishlistId: demoWishlist.id,
          productId: product.id
        }
      });
    }

    for (const product of products.slice(4, 6)) {
      await prisma.wishlistItem.upsert({
        where: {
          wishlistId_productId: {
            wishlistId: practiceWishlist.id,
            productId: product.id
          }
        },
        update: {},
        create: {
          wishlistId: practiceWishlist.id,
          productId: product.id
        }
      });
    }

    const demoOrderItems = demoCartProducts
      .map((product, index) => {
        const variant = product.variants[0];

        if (!variant) return null;

        const quantity = index + 1;
        const unitPrice = variant.price;
        const totalPrice = unitPrice.mul(quantity);

        return {
          productId: product.id,
          variantId: variant.id,
          productName: product.name,
          variantLabel: variant.label,
          image: product.images[0]?.url ?? variant.image ?? null,
          quantity,
          unitPrice,
          totalPrice
        };
      })
      .filter(
        (
          item
        ): item is NonNullable<typeof item> => Boolean(item)
      );

    const demoSubtotal = demoOrderItems.reduce(
      (total, item) => total.add(item.totalPrice),
      demoOrderItems[0].totalPrice.mul(0)
    );

    const demoDeliveryFee = demoSubtotal.mul(0).add(3500);
    const demoTotal = demoSubtotal.add(demoDeliveryFee);

    const orderNumber = `DEMO-${user.id.slice(0, 6).toUpperCase()}`;

    const demoOrder = await prisma.order.upsert({
      where: {
        orderNumber
      },
      update: {
        workspaceId: workspaces.demo.id,
        userId: user.id,
        status: 'DELIVERED',
        paymentStatus: 'PAID',
        subtotal: demoSubtotal,
        deliveryFee: demoDeliveryFee,
        total: demoTotal,
        mode: 'DEMO',
        dataSource: 'SYNTHETIC',
        notes: 'Synthetic completed order created by the RCENTZ seed engine.'
      },
      create: {
        orderNumber,
        workspaceId: workspaces.demo.id,
        userId: user.id,
        status: 'DELIVERED',
        paymentStatus: 'PAID',
        subtotal: demoSubtotal,
        deliveryFee: demoDeliveryFee,
        total: demoTotal,
        mode: 'DEMO',
        dataSource: 'SYNTHETIC',
        notes: 'Synthetic completed order created by the RCENTZ seed engine.',
        deliveryAddress: {
          recipientName: 'Demo Member',
          phone: '+2348000000000',
          addressLine1: '12 Practice Avenue',
          city: 'Warri',
          state: 'Delta',
          country: 'Nigeria'
        }
      }
    });

    orders += 1;

    await prisma.orderItem.deleteMany({
      where: {
        orderId: demoOrder.id
      }
    });

    await prisma.orderItem.createMany({
      data: demoOrderItems.map(item => ({
        orderId: demoOrder.id,
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        variantLabel: item.variantLabel,
        image: item.image,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      }))
    });

    await prisma.payment.upsert({
      where: {
        reference: `PAPER-${demoOrder.id}`
      },
      update: {
        amount: demoTotal,
        status: 'PAID',
        paidAt: new Date(),
        metadata: {
          mode: 'PAPER',
          workspaceMode: 'DEMO',
          source: 'seed-engine'
        }
      },
      create: {
        orderId: demoOrder.id,
        provider: 'paper-wallet',
        reference: `PAPER-${demoOrder.id}`,
        amount: demoTotal,
        status: 'PAID',
        paidAt: new Date(),
        metadata: {
          mode: 'PAPER',
          workspaceMode: 'DEMO',
          source: 'seed-engine'
        }
      }
    });

    payments += 1;
  }

  console.log(
    `✓ ${demoCarts} demo carts, ${practiceCarts} practice carts, ${wishlists} wishlists, ${orders} orders and ${payments} paper payments ready.`
  );
}