import 'server-only';

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

  const productRecord = await prisma.product.findFirst({
    where: {
      active: true,
      status: 'PUBLISHED',
      workspace: {
        active: true,
        mode: 'LIVE'
      },
      AND: [
        { OR: [{ id: normalizedIdentifier }, { slug: normalizedIdentifier }] },
        {
          OR: [
            { vendorProfileId: null },
            {
              vendorProfile: { is: { active: true, status: 'ACTIVE' } },
              workspace: { commerceMode: 'MULTI_VENDOR' }
            }
          ]
        }
      ]
    },
    include: productMappingInclude
  });

  if (!productRecord) {
    return null;
  }

  const relatedRecords = await prisma.product.findMany({
    where: {
      workspaceId: productRecord.workspaceId,
      active: true,
      status: 'PUBLISHED',
      OR: [
        { vendorProfileId: null },
        { vendorProfile: { is: { active: true, status: 'ACTIVE' } }, workspace: { commerceMode: 'MULTI_VENDOR' } }
      ],
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
