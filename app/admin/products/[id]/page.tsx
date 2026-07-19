import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import AdminProductEditor from '@/features/admin/products/AdminProductEditor';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const managementRoles = ['MANAGER', 'ADMIN', 'OWNER', 'SUPER_ADMIN'] as const;

export default async function EditAdminProductPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/sign-in');
  const { id } = await params;
  const [product, categories, membership] = await Promise.all([
    prisma.product.findUnique({ where: { id }, select: { id: true, name: true, slug: true, categoryId: true, shortDescription: true, longDescription: true, estimatedDelivery: true, tags: true, active: true, featured: true, isNew: true, discountPercentage: true } }),
    prisma.category.findMany({ where: { active: true }, orderBy: { position: 'asc' }, select: { id: true, label: true } }),
    prisma.workspaceMembership.findFirst({ where: { userId: session.user.id, active: true }, select: { role: true } })
  ]);
  if (!product) notFound();
  return <AdminProductEditor product={product} categories={categories} canManage={Boolean(membership && managementRoles.includes(membership.role as typeof managementRoles[number]))} />;
}
