import AdminProductEditor from '@/features/admin/products/AdminProductEditor';
import { getAdminAccess } from '@/features/admin/auth/adminPermissions';
import { prisma } from '@/lib/prisma';

export default async function NewAdminProductPage() {
  const access = await getAdminAccess();
  const categories = await prisma.category.findMany({ where: { active: true }, orderBy: { position: 'asc' }, select: { id: true, label: true } });
  return <AdminProductEditor product={null} categories={categories} canManage={access.permissions.has('product:create')} />;
}
