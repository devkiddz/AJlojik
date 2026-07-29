import AdminProductEditor from '@/features/admin/products/AdminProductEditor';
import { getAdminAccess } from '@/features/admin/auth/adminPermissions';
import { prisma } from '@/lib/prisma';

export default async function NewAdminProductPage() {
  const access = await getAdminAccess();

  const [categories, brands, media, vendors] = await Promise.all([
    prisma.category.findMany({
      where: { active: true },
      orderBy: { position: 'asc' },
      select: {
        id: true,
        label: true,
        subcategories: {
          where: { active: true },
          orderBy: { position: 'asc' },
          select: { id: true, label: true }
        }
      }
    }),
    prisma.brand.findMany({ where: { active: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.mediaAsset.findMany({
      where: { workspaceId: access.membership.workspaceId, status: 'ACTIVE', resourceType: 'IMAGE' },
      orderBy: { createdAt: 'desc' },
      take: 120,
      select: { id: true, secureUrl: true, displayName: true, originalFilename: true }
    }),
    access.membership.workspace.commerceMode === 'MULTI_VENDOR'
      ? prisma.vendorProfile.findMany({
          where: { workspaceId: access.membership.workspaceId, status: 'ACTIVE', active: true },
          orderBy: { name: 'asc' },
          select: { id: true, name: true }
        })
      : Promise.resolve([])
  ]);

  return (
    <AdminProductEditor
      product={null}
      taxonomy={{ categories, brands, vendors }}
      media={media}
      canManage={access.permissions.has('product:create')}
      canPublish={access.permissions.has('approval:review')}
      multivendorEnabled={access.membership.workspace.commerceMode === 'MULTI_VENDOR'}
    />
  );
}
