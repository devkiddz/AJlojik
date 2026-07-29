'use server';

import { revalidatePath } from 'next/cache';

import { requireAdminPermission } from '@/features/admin/auth/adminPermissions';
import { prisma } from '@/lib/prisma';

const value = (data: FormData, key: string) =>
  String(data.get(key) ?? '').trim();

function isSafeDestination(valueToCheck: string): boolean {
  if (!valueToCheck) {
    return true;
  }

  if (valueToCheck.startsWith('/')) {
    return true;
  }

  try {
    return new URL(valueToCheck).protocol === 'https:';
  } catch {
    return false;
  }
}

function isMediaReference(valueToCheck: string): boolean {
  if (!valueToCheck) {
    return true;
  }

  if (valueToCheck.startsWith('/')) {
    return true;
  }

  try {
    const url = new URL(valueToCheck);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export async function updateStorefrontHero(formData: FormData) {
  const access = await requireAdminPermission('system:manage');
  const workspaceId = access.membership.workspaceId;
  const title = value(formData, 'title');

  if (!title) {
    throw new Error('Hero title is required.');
  }

  const mediaAssetId = value(formData, 'mediaAssetId') || null;
  const posterMediaAssetId = value(formData, 'posterMediaAssetId') || null;
  const selectedIds = [mediaAssetId, posterMediaAssetId].filter(
    (id): id is string => Boolean(id)
  );

  const selectedAssets = selectedIds.length
    ? await prisma.mediaAsset.findMany({
        where: {
          id: { in: selectedIds },
          workspaceId,
          vendorProfileId: null,
          status: 'ACTIVE'
        },
        select: {
          id: true,
          secureUrl: true,
          resourceType: true
        }
      })
    : [];

  if (selectedAssets.length !== new Set(selectedIds).size) {
    throw new Error(
      'One or more selected hero assets are unavailable or not owned by this workspace.'
    );
  }

  const assetMap = new Map(selectedAssets.map(asset => [asset.id, asset]));
  const primaryAsset = mediaAssetId ? assetMap.get(mediaAssetId) : null;
  const posterAsset = posterMediaAssetId
    ? assetMap.get(posterMediaAssetId)
    : null;

  if (posterAsset && posterAsset.resourceType !== 'IMAGE') {
    throw new Error('The hero poster must be an image.');
  }

  const externalMediaUrl = value(formData, 'mediaUrl');
  const externalPosterUrl = value(formData, 'posterUrl');

  if (!isMediaReference(externalMediaUrl)) {
    throw new Error('The external hero media URL is invalid.');
  }

  if (!isMediaReference(externalPosterUrl)) {
    throw new Error('The external hero poster URL is invalid.');
  }

  const requestedMediaType =
    value(formData, 'mediaType') === 'IMAGE' ? 'IMAGE' : 'VIDEO';
  const mediaType = primaryAsset
    ? primaryAsset.resourceType === 'VIDEO'
      ? 'VIDEO'
      : 'IMAGE'
    : requestedMediaType;
  const mediaUrl = primaryAsset?.secureUrl || externalMediaUrl || null;
  const posterUrl = posterAsset?.secureUrl || externalPosterUrl || null;

  if (!mediaUrl) {
    throw new Error(
      'Choose hero media from Media Studio or provide an advanced external fallback.'
    );
  }

  const primaryHref = value(formData, 'primaryHref');
  const secondaryHref = value(formData, 'secondaryHref');

  if (!isSafeDestination(primaryHref) || !isSafeDestination(secondaryHref)) {
    throw new Error('Hero actions must use an internal path or an HTTPS URL.');
  }

  const data = {
    enabled: formData.get('enabled') === 'on',
    autoplay: formData.get('autoplay') === 'on',
    mediaType,
    mediaUrl,
    posterUrl,
    mediaAssetId,
    posterMediaAssetId,
    eyebrow: value(formData, 'eyebrow'),
    title,
    summary: value(formData, 'summary') || null,
    primaryLabel: value(formData, 'primaryLabel'),
    primaryHref,
    secondaryLabel: value(formData, 'secondaryLabel'),
    secondaryHref
  };

  const hero = await prisma.storefrontHero.upsert({
    where: { workspaceId },
    create: {
      workspaceId,
      ...data
    },
    update: data
  });

  await prisma.adminAuditEvent.create({
    data: {
      workspaceId,
      actorId: access.session.user.id,
      action: 'STOREFRONT_HERO_UPDATED',
      targetType: 'EXPERIENCE',
      targetId: hero.id,
      summary: `Homepage hero updated by ${access.session.user.name}.`,
      metadata: {
        mediaType,
        mediaAssetId,
        posterMediaAssetId,
        enabled: data.enabled
      }
    }
  });

  revalidatePath('/');
  revalidatePath('/admin/hero');
  revalidatePath('/admin/activity');
}
