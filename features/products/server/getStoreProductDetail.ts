import 'server-only';

import { resolvePublicCommerceWorkspace } from '@/features/commerce-mode/server/resolvePublicCommerceWorkspace';
import {
  mapProductRecord,
  productMappingInclude
} from '@/features/products/server/productMapper';
import { prisma } from '@/lib/prisma';
import type { ProductType } from '@/types/types';

export type StoreProductDetail = {
  product: ProductType;
  gallery: string[];
  relatedProducts: ProductType[];
};

function uniqueMedia(values: Array<string | null | undefined>): string[] {
  return Array.from(
    new Set(values.filter((value): value is string => Boolean(value)))
  );
}

export async function getStoreProductDetail(
  identifier: string
): Promise<StoreProductDetail | null> {
  const normalizedIdentifier = decodeURIComponent(identifier).trim();

  if (!normalizedIdentifier) {
    return null;
  }

  const workspace = await resolvePublicCommerceWorkspace();

  if (!workspace) {
    return null;
  }

  const ownershipWhere = workspace.capabilities.vendorCatalogVisible
    ? {
        OR: [
          { vendorProfileId: null },
          {
            vendorProfile: {
              is: {
                active: true,
                status: 'ACTIVE' as const
              }
            }
          }
        ]
      }
    : {
        vendorProfileId: null
      };

  const productRecord = await prisma.product.findFirst({
    where: {
      workspaceId: workspace.id,
      active: true,
      status: 'PUBLISHED',
      AND: [
        {
          OR: [
            { id: normalizedIdentifier },
            { slug: normalizedIdentifier }
          ]
        },
        ownershipWhere
      ]
    },
    include: productMappingInclude
  });

  if (!productRecord) {
    return null;
  }

  const relatedRecords = await prisma.product.findMany({
    where: {
      workspaceId: workspace.id,
      active: true,
      status: 'PUBLISHED',
      ...ownershipWhere,
      id: {
        not: productRecord.id
      },
      categoryId: productRecord.categoryId
    },
    include: productMappingInclude,
    orderBy: [
      { featured: 'desc' },
      { soldCount: 'desc' },
      { rating: 'desc' },
      { updatedAt: 'desc' }
    ],
    take: 12
  });

  const product = mapProductRecord(productRecord);

  return {
    product,
    gallery: uniqueMedia([
      ...productRecord.images.map(image => image.url),
      ...product.variants.map(variant => variant.image)
    ]),
    relatedProducts: relatedRecords.map(mapProductRecord)
  };
}
