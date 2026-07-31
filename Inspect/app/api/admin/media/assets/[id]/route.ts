import { NextResponse } from 'next/server';

import { getAdminApiAccess } from '@/features/admin/auth/adminPermissions';
import { destroyCloudinaryAsset } from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';

async function resolveAsset(id: string, workspaceId: string) {
  return prisma.mediaAsset.findFirst({
    where: { id, workspaceId, status: 'ACTIVE' },
    include: {
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
          storefrontHeroMedia: true,
          storefrontHeroPosters: true,
          vendorLogos: true
        }
      }
    }
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await getAdminApiAccess(request.headers);

  if (!access) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  if (!access.permissions.has('media:manage')) {
    return NextResponse.json(
      { error: 'Media management permission is required.' },
      { status: 403 }
    );
  }

  const { id } = await params;
  const asset = await resolveAsset(id, access.membership.workspaceId);

  if (!asset) {
    return NextResponse.json({ error: 'Media asset was not found.' }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as
    | { displayName?: string; altText?: string }
    | null;
  const displayName = body?.displayName?.trim() || null;
  const altText = body?.altText?.trim() || null;

  if ((displayName?.length ?? 0) > 160 || (altText?.length ?? 0) > 500) {
    return NextResponse.json(
      { error: 'Media name or alternative text is too long.' },
      { status: 400 }
    );
  }

  const updated = await prisma.$transaction(async transaction => {
    const result = await transaction.mediaAsset.update({
      where: { id: asset.id },
      data: { displayName, altText }
    });

    await transaction.adminAuditEvent.create({
      data: {
        workspaceId: access.membership.workspaceId,
        actorId: access.session.user.id,
        action: 'MEDIA_METADATA_UPDATED',
        targetType: 'MEDIA',
        targetId: asset.id,
        summary: `${displayName ?? asset.publicId} media details were updated.`
      }
    });

    return result;
  });

  return NextResponse.json({ asset: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await getAdminApiAccess(request.headers);

  if (!access) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  if (!access.permissions.has('media:delete')) {
    return NextResponse.json(
      { error: 'Media deletion permission is required.' },
      { status: 403 }
    );
  }

  const { id } = await params;
  const asset = await resolveAsset(id, access.membership.workspaceId);

  if (!asset) {
    return NextResponse.json({ error: 'Media asset was not found.' }, { status: 404 });
  }

  const usageCount = Object.values(asset._count).reduce(
    (total, count) => total + count,
    0
  );

  if (usageCount > 0) {
    return NextResponse.json(
      {
        error: `This asset is still used in ${usageCount} published or managed record${
          usageCount === 1 ? '' : 's'
        }.`
      },
      { status: 409 }
    );
  }

  await destroyCloudinaryAsset({
    publicId: asset.publicId,
    resourceType:
      asset.resourceType === 'VIDEO'
        ? 'video'
        : asset.resourceType === 'RAW'
          ? 'raw'
          : 'image'
  });

  await prisma.$transaction([
    prisma.mediaAsset.update({
      where: { id: asset.id },
      data: { status: 'DELETED' }
    }),
    prisma.adminAuditEvent.create({
      data: {
        workspaceId: access.membership.workspaceId,
        actorId: access.session.user.id,
        action: 'MEDIA_DELETED',
        targetType: 'MEDIA',
        targetId: asset.id,
        summary: `${asset.displayName ?? asset.publicId} was removed from Media Studio.`
      }
    })
  ]);

  return NextResponse.json({ success: true });
}
