import type {
  DataSource,
  ExperienceEventType,
  Prisma,
  PrismaClient
} from '../../lib/generated/prisma/client';

import type { SeededWorkspaces } from './workspace.seed';

type EventSeed = {
  type: ExperienceEventType;
  dataSource: DataSource;
  source: string;
  productId?: string;
  categorySlug?: string;
  collectionId?: string;
  campaignId?: string;
  searchTerm?: string;
  metadata?: Prisma.InputJsonValue;
};

export async function seedExperienceEvents(
  prisma: PrismaClient,
  workspaces: SeededWorkspaces
) {
  console.log('Seeding synthetic experience events...');

  const users = await prisma.user.findMany({
    select: {
      id: true
    }
  });

  const products = await prisma.product.findMany({
    take: 8,
    orderBy: {
      createdAt: 'asc'
    },
    select: {
      id: true,
      category: {
        select: {
          slug: true
        }
      }
    }
  });

  const demoEvents: EventSeed[] = [
    {
      type: 'PAGE_VIEW',
      dataSource: 'SYNTHETIC',
      source: 'demo-home'
    },
    {
      type: 'CATEGORY_VIEW',
      dataSource: 'SYNTHETIC',
      source: 'demo-feed',
      categorySlug: 'wines'
    },
    {
      type: 'SEARCH',
      dataSource: 'SYNTHETIC',
      source: 'demo-search',
      searchTerm: 'champagne'
    },
    {
      type: 'CAMPAIGN_VIEW',
      dataSource: 'SYNTHETIC',
      source: 'demo-feed',
      campaignId: 'weekend-rush'
    },
    {
      type: 'ADD_TO_CART',
      dataSource: 'SYNTHETIC',
      source: 'demo-product'
    },
    {
      type: 'CHECKOUT_STARTED',
      dataSource: 'SYNTHETIC',
      source: 'demo-cart'
    },
    {
      type: 'PAYMENT_COMPLETED',
      dataSource: 'SYNTHETIC',
      source: 'paper-wallet',
      metadata: {
        paymentMode: 'PAPER'
      }
    },
    {
      type: 'DELIVERY_VIEWED',
      dataSource: 'SYNTHETIC',
      source: 'demo-order'
    }
  ];

  const practiceEvents: EventSeed[] = [
    {
      type: 'PAGE_VIEW',
      dataSource: 'PRACTICE',
      source: 'practice-home'
    },
    {
      type: 'SEARCH',
      dataSource: 'PRACTICE',
      source: 'practice-search',
      searchTerm: 'birthday package'
    },
    {
      type: 'ADD_TO_WISHLIST',
      dataSource: 'PRACTICE',
      source: 'practice-product'
    },
    {
      type: 'ADD_TO_CART',
      dataSource: 'PRACTICE',
      source: 'practice-product'
    },
    {
      type: 'WORKSPACE_SWITCHED',
      dataSource: 'PRACTICE',
      source: 'workspace-switcher',
      metadata: {
        from: 'LIVE',
        to: 'PRACTICE'
      }
    }
  ];

  let createdEvents = 0;

  for (const user of users) {
    for (const [index, event] of demoEvents.entries()) {
      const product = products[index % products.length];

      await prisma.experienceEvent.create({
        data: {
          workspaceId: workspaces.demo.id,
          userId: user.id,
          sessionId: `seed-demo-${user.id}`,
          type: event.type,
          source: event.source,
          dataSource: event.dataSource,
          productId:
            event.type === 'PRODUCT_VIEW' ||
            event.type === 'ADD_TO_CART' ||
            event.type === 'ADD_TO_WISHLIST'
              ? product?.id
              : undefined,
          categorySlug:
            event.categorySlug ?? product?.category.slug ?? undefined,
          collectionId: event.collectionId,
          campaignId: event.campaignId,
          searchTerm: event.searchTerm,
          metadata: event.metadata
        }
      });

      createdEvents += 1;
    }

    for (const [index, event] of practiceEvents.entries()) {
      const product = products[index % products.length];

      await prisma.experienceEvent.create({
        data: {
          workspaceId: workspaces.practice.id,
          userId: user.id,
          sessionId: `seed-practice-${user.id}`,
          type: event.type,
          source: event.source,
          dataSource: event.dataSource,
          productId:
            event.type === 'PRODUCT_VIEW' ||
            event.type === 'ADD_TO_CART' ||
            event.type === 'ADD_TO_WISHLIST'
              ? product?.id
              : undefined,
          categorySlug:
            event.categorySlug ?? product?.category.slug ?? undefined,
          collectionId: event.collectionId,
          campaignId: event.campaignId,
          searchTerm: event.searchTerm,
          metadata: event.metadata
        }
      });

      createdEvents += 1;
    }
  }

  console.log(`✓ ${createdEvents} synthetic experience events created.`);
}