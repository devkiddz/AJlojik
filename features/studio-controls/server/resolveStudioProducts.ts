import 'server-only';

import { prisma } from '@/lib/prisma';

import type { StudioProductOption } from '../studioTypes';

export async function resolveStudioProducts(input: {
  workspaceId: string;
  vendorProfileId?: string | null;
  includeArchived?: boolean;
}): Promise<StudioProductOption[]> {
  const products = await prisma.product.findMany({
    where: {
      workspaceId: input.workspaceId,
      ...(input.vendorProfileId ? { vendorProfileId: input.vendorProfileId } : {}),
      ...(input.includeArchived ? {} : { status: { not: 'ARCHIVED' } })
    },
    select: {
      id: true,
      name: true,
      status: true,
      active: true,
      category: { select: { label: true } },
      vendorProfile: { select: { name: true } },
      images: {
        orderBy: [{ primary: 'desc' }, { position: 'asc' }],
        take: 1,
        select: { url: true }
      },
      variants: {
        where: { active: true },
        orderBy: { position: 'asc' },
        select: {
          price: true,
          inventory: { select: { quantity: true, reserved: true } }
        }
      }
    },
    orderBy: { name: 'asc' },
    take: 1000
  });

  return products.map(product => ({
    id: product.id,
    name: product.name,
    imageUrl: product.images[0]?.url ?? null,
    category: product.category.label,
    vendor: product.vendorProfile?.name ?? null,
    status: product.status,
    active: product.active,
    available: product.variants.reduce(
      (total, variant) =>
        total + Math.max(0, (variant.inventory?.quantity ?? 0) - (variant.inventory?.reserved ?? 0)),
      0
    ),
    variants: product.variants.length,
    priceLabel: product.variants[0]
      ? new Intl.NumberFormat('en-NG', {
          style: 'currency',
          currency: 'NGN',
          maximumFractionDigits: 0
        }).format(Number(product.variants[0].price))
      : null
  }));
}
