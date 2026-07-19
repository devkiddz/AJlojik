import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import AdminProductEditor from '@/features/admin/products/AdminProductEditor';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const managementRoles = ['MANAGER', 'ADMIN', 'OWNER', 'SUPER_ADMIN'] as const;

export default async function NewAdminProductPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/sign-in');
  const [categories, membership] = await Promise.all([
    prisma.category.findMany({ where: { active: true }, orderBy: { position: 'asc' }, select: { id: true, label: true } }),
    prisma.workspaceMembership.findFirst({ where: { userId: session.user.id, active: true }, select: { role: true } })
  ]);
  return <AdminProductEditor product={null} categories={categories} canManage={Boolean(membership && managementRoles.includes(membership.role as typeof managementRoles[number]))} />;
}
