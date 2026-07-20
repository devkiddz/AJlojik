import { notFound } from 'next/navigation';

import AdminProductEditor from '@/features/admin/products/AdminProductEditor';
import { getAdminAccess } from '@/features/admin/auth/adminPermissions';
import { prisma } from '@/lib/prisma';

export default async function EditAdminProductPage({ params }: { params: Promise<{ id: string }> }) {
  const access = await getAdminAccess();
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, select: { id: true, name: true, slug: true, categoryId: true, shortDescription: true, longDescription: true, estimatedDelivery: true, tags: true, active: true, featured: true, isNew: true, discountPercentage: true } }),
    prisma.category.findMany({ where: { active: true }, orderBy: { position: 'asc' }, select: { id: true, label: true } })
  ]);
  if (!product) notFound();
  return <AdminProductEditor product={product} categories={categories} canManage={access.permissions.has('product:update')} />;
}
