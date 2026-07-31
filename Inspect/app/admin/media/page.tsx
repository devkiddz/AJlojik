import { CloudUpload, FileImage, FileVideo2, HardDrive } from 'lucide-react';

import { AdminMetric, AdminPage, AdminPageHeader } from '@/features/admin/components';
import { getAdminAccess } from '@/features/admin/auth/adminPermissions';
import { MediaStudioDashboard, type MediaStudioAsset } from '@/features/admin/media';
import { cloudinaryIsConfigured } from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';

export default async function AdminMediaPage() {
  const access = await getAdminAccess();

  if (!access.permissions.has('media:view')) {
    throw new Error('Media Studio access is required.');
  }

  const assets = await prisma.mediaAsset.findMany({
    where: { workspaceId: access.membership.workspaceId, status: 'ACTIVE' },
    include: {
      uploadedBy: { select: { name: true } },
      vendorProfile: { select: { name: true } },
      _count: {
        select: {
          productImages: true,
          productVariants: true,
          promotionBanners: true,
          collectionCovers: true,
          storeStudioPrimaryAssets: true,
          storeStudioMobileAssets: true,
          storeStudioCoverAssets: true,
          storeStudioPosterAssets: true,
          vendorLogos: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 300
  });

  const records: MediaStudioAsset[] = assets.map(asset => ({
    id: asset.id,
    publicId: asset.publicId,
    secureUrl: asset.secureUrl,
    resourceType: asset.resourceType,
    format: asset.format,
    width: asset.width,
    height: asset.height,
    duration: asset.duration,
    bytes: asset.bytes,
    folder: asset.folder,
    displayName: asset.displayName,
    originalFilename: asset.originalFilename,
    altText: asset.altText,
    createdAt: asset.createdAt.toISOString(),
    uploadedBy: asset.uploadedBy,
    vendorProfile: asset.vendorProfile,
    usageCount: Object.values(asset._count).reduce((total, count) => total + count, 0)
  }));

  const imageCount = records.filter(asset => asset.resourceType === 'IMAGE').length;
  const videoCount = records.filter(asset => asset.resourceType === 'VIDEO').length;
  const storageBytes = records.reduce((total, asset) => total + asset.bytes, 0);

  return (
    <AdminPage>
      <div className="mx-auto max-w-[96rem] space-y-5">
        <AdminPageHeader
          eyebrow="Shared Studio foundation"
          title="Media Studio"
          description="Upload once, then reuse workspace-owned images and videos across Products, Collections, Promotions, Banners, Stories and Reels."
        />
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AdminMetric icon={CloudUpload} label="Active assets" value={records.length} detail="Workspace-scoped Cloudinary records" />
          <AdminMetric icon={FileImage} label="Images" value={imageCount} detail="Product and campaign-ready media" />
          <AdminMetric icon={FileVideo2} label="Videos" value={videoCount} detail="Stories and Reels media" />
          <AdminMetric icon={HardDrive} label="Visible storage" value={`${(storageBytes / 1024 / 1024).toFixed(1)} MB`} detail="Current gallery window" />
        </section>
        <MediaStudioDashboard
          assets={records}
          configured={cloudinaryIsConfigured()}
          canUpload={access.permissions.has('media:manage')}
          canDelete={access.permissions.has('media:delete')}
        />
      </div>
    </AdminPage>
  );
}
