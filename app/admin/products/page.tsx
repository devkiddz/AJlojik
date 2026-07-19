import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import AdminProductsDashboard, { type AdminProductRecord } from '@/features/admin/products/AdminProductsDashboard';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function AdminProductsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect('/sign-in');

  const [products, membership] = await Promise.all([
    prisma.product.findMany({
      include: {
        category: { select: { label: true, slug: true } },
        subcategory: { select: { label: true } },
        brand: { select: { name: true } },
        images: { orderBy: { position: 'asc' }, take: 1 },
        variants: {
          include: { inventory: true },
          orderBy: { position: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    }),
    prisma.workspaceMembership.findFirst({
      where: { userId: session.user.id, active: true },
      orderBy: { joinedAt: 'asc' },
      select: { role: true, workspace: { select: { name: true, mode: true } } }
    })
  ]);

  const records: AdminProductRecord[] = products.map(product => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.shortDescription ?? '',
    image: product.images[0]?.url ?? product.variants.find(variant => variant.image)?.image ?? '',
    category: product.category.label,
    categorySlug: product.category.slug,
    subcategory: product.subcategory?.label ?? null,
    brand: product.brand?.name ?? null,
    active: product.active,
    featured: product.featured,
    isNew: product.isNew,
    rating: product.rating,
    reviews: product.reviewsCount,
    sold: product.soldCount,
    discount: product.discountPercentage,
    updatedAt: product.updatedAt.toISOString(),
    variants: product.variants.map(variant => ({
      id: variant.id,
      label: variant.label,
      sku: variant.sku,
      price: Number(variant.price),
      compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice) : null,
      active: variant.active,
      quantity: variant.inventory?.quantity ?? 0,
      reserved: variant.inventory?.reserved ?? 0,
      reorderLevel: variant.inventory?.reorderLevel ?? 5
    }))
  }));

  return (
    <AdminProductsDashboard
      products={records}
      operator={{
        name: session.user.name,
        role: membership?.role ?? 'CATALOG_OPERATOR',
        workspace: membership?.workspace.name ?? 'AJ Logik',
        mode: membership?.workspace.mode ?? 'LIVE'
      }}
    />
  );
}
