import 'server-only';

import {
  mapProductRecord,
  productMappingInclude
} from '@/features/products/server/productMapper';
import { prisma } from '@/lib/prisma';
import type { ProductType } from '@/types/types';

import type {
  StoreStudioAction,
  StoreStudioReelProjection
} from '../contracts';

export type StoreReelDetail = {
  reel: StoreStudioReelProjection;
  product: ProductType | null;
};

function resolveAction({
  actionLabel,
  actionHref
}: {
  actionLabel: string | null;
  actionHref: string | null;
}): StoreStudioAction | null {
  if (!actionLabel || !actionHref) {
    return null;
  }

  return {
    label: actionLabel,
    href: actionHref
  };
}

export async function getStoreReelDetail(
  reelId: string
): Promise<StoreReelDetail | null> {
  const now = new Date();

  const asset = await prisma.storeStudioAsset.findFirst({
    where: {
      id: reelId,
      active: true,
      mediaType: 'VIDEO',

      campaign: {
        is: {
          type: 'REEL',
          active: true,

          status: {
            in: ['SCHEDULED', 'ACTIVE']
          },

          AND: [
            {
              OR: [
                { startsAt: null },
                { startsAt: { lte: now } }
              ]
            },
            {
              OR: [
                { endsAt: null },
                { endsAt: { gte: now } }
              ]
            }
          ],

          workspace: {
            active: true
          }
        }
      }
    },

    include: {
      campaign: {
        include: {
          vendor: { select: { name: true } },
          vendorProfile: { select: { name: true, status: true, active: true } },
          workspace: { select: { commerceMode: true } }
        }
      }
    }
  });

  if (!asset) {
    return null;
  }

  if (asset.campaign.vendorProfileId && (asset.campaign.workspace.commerceMode !== 'MULTI_VENDOR' || asset.campaign.vendorProfile?.status !== 'ACTIVE' || !asset.campaign.vendorProfile.active)) {
    return null;
  }

  const productRecord = asset.productId
    ? await prisma.product.findFirst({
        where: {
          id: asset.productId,
          workspaceId: asset.campaign.workspaceId,
          active: true,
          status: 'PUBLISHED',
          OR: [
            { vendorProfileId: null },
            {
              vendorProfile: {
                is: { active: true, status: 'ACTIVE' }
              },
              workspace: { commerceMode: 'MULTI_VENDOR' }
            }
          ]
        },
        include: productMappingInclude
      })
    : null;

  const campaignPriority =
    asset.campaign.adminWeight +
    asset.campaign.requestedPriority;

  return {
    reel: {
      id: asset.id,
      campaignId: asset.campaignId,
      workspaceId: asset.campaign.workspaceId,
      vendorId: asset.campaign.vendorProfileId ?? asset.campaign.vendorId,
      vendorName: asset.campaign.vendorProfile?.name ?? asset.campaign.vendor?.name ?? null,
      title: asset.title ?? asset.campaign.title,
      caption:
        asset.description ??
        asset.campaign.description,
      videoUrl: asset.mediaUrl,
      posterUrl:
        asset.posterUrl ??
        asset.coverUrl,
      durationMs:
        asset.durationSeconds &&
        asset.durationSeconds > 0
          ? asset.durationSeconds * 1_000
          : null,
      autoplay: asset.autoplay,
      action: resolveAction({
        actionLabel: asset.actionLabel,
        actionHref: asset.actionHref
      }),
      detailHref: `/reels/${asset.id}`,
      productId: asset.productId,
      promotionId: asset.promotionId,
      collectionId: asset.collectionId,
      priority: campaignPriority
    },

    product: productRecord
      ? mapProductRecord(productRecord)
      : null
  };
}
