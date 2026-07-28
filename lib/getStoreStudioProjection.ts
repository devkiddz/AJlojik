import 'server-only';

import { prisma } from '@/lib/prisma';

import type {
  StoreStudioAction,
  StoreStudioProjection
} from '@/features/store-studio/contracts';
const DEFAULT_BANNER_DURATION_MS = 6_000;
const DEFAULT_STORY_DURATION_MS = 5_000;

function resolveDurationMs(
  durationSeconds: number | null,
  fallbackDurationMs: number
): number {
  if (
    durationSeconds === null ||
    durationSeconds <= 0
  ) {
    return fallbackDurationMs;
  }

  return durationSeconds * 1_000;
}

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

export async function getStoreStudioProjection(
  workspaceId: string
): Promise<StoreStudioProjection> {
  const now = new Date();

  const campaigns =
    await prisma.storeStudioCampaign.findMany({
      where: {
        workspaceId,
        active: true,

        status: {
          in: [
            'APPROVED',
            'SCHEDULED',
            'ACTIVE'
          ]
        },

        AND: [
          {
            OR: [
              {
                startsAt: null
              },
              {
                startsAt: {
                  lte: now
                }
              }
            ]
          },

          {
            OR: [
              {
                endsAt: null
              },
              {
                endsAt: {
                  gte: now
                }
              }
            ]
          }
        ]
      },

      include: {
        assets: {
          where: {
            active: true
          },

          orderBy: {
            position: 'asc'
          }
        },

        vendor: {
          select: {
            name: true
          }
        }
      },

      orderBy: [
        {
          adminWeight: 'desc'
        },
        {
          requestedPriority: 'desc'
        },
        {
          updatedAt: 'desc'
        }
      ]
    });

  const banners:
    StoreStudioProjection['banners'] = [];

  const stories:
    StoreStudioProjection['stories'] = [];

  const reels:
    StoreStudioProjection['reels'] = [];

  for (const campaign of campaigns) {
    const campaignPriority =
      campaign.adminWeight +
      campaign.requestedPriority;

    for (const asset of campaign.assets) {
      const action = resolveAction({
        actionLabel:
          asset.actionLabel,

        actionHref:
          asset.actionHref
      });

      if (
        campaign.type === 'BANNER'
      ) {
        banners.push({
          id: asset.id,
          campaignId: campaign.id,

          mediaType:
            asset.mediaType === 'VIDEO'
              ? 'video'
              : 'image',

          mediaUrl:
            asset.mediaUrl,

          mobileMediaUrl:
            asset.mobileMediaUrl,

          posterUrl:
            asset.posterUrl,

          eyebrow:
            asset.eyebrow,

          title:
            asset.title ??
            campaign.title,

          description:
            asset.description ??
            campaign.description,

          primaryAction:
            action,

          secondaryAction:
            null,

          autoplay:
            asset.autoplay,

          durationMs:
            resolveDurationMs(
              asset.durationSeconds,
              DEFAULT_BANNER_DURATION_MS
            ),

          position:
            asset.position
        });

        continue;
      }

      if (
        campaign.type === 'STORY'
      ) {
        stories.push({
          id: asset.id,
          campaignId: campaign.id,
          workspaceId,

          vendorId:
            campaign.vendorId,

          vendorName:
            campaign.vendor?.name ??
            null,

          title:
            asset.title ??
            campaign.title,

          label:
            asset.eyebrow ??
            asset.title ??
            campaign.title,

          mediaType:
            asset.mediaType === 'VIDEO'
              ? 'video'
              : 'image',

          mediaUrl:
            asset.mediaUrl,

          coverUrl:
            asset.coverUrl ??
            asset.posterUrl ??
            asset.mediaUrl,

          posterUrl:
            asset.posterUrl,

          durationMs:
            resolveDurationMs(
              asset.durationSeconds,
              DEFAULT_STORY_DURATION_MS
            ),

          action,

          productIds:
            asset.productId
              ? [asset.productId]
              : [],

          promotionId:
            asset.promotionId,

          collectionId:
            asset.collectionId,

          priority:
            campaignPriority
        });

        continue;
      }

    if (
  campaign.type === 'REEL' &&
  asset.mediaType === 'VIDEO'
) {
  reels.push({
    id: asset.id,
    campaignId: campaign.id,
    workspaceId,

    vendorId:
      campaign.vendorId,

    vendorName:
      campaign.vendor?.name ??
      null,

    title:
      asset.title ??
      campaign.title,

    caption:
      asset.description ??
      campaign.description,

    videoUrl:
      asset.mediaUrl,

    posterUrl:
      asset.posterUrl ??
      asset.coverUrl,

    detailHref:
      `/reels/${asset.id}`,

    durationMs:
      asset.durationSeconds &&
      asset.durationSeconds > 0
        ? asset.durationSeconds * 1_000
        : null,

    autoplay:
      asset.autoplay,

    action,

    productId:
      asset.productId,

    promotionId:
      asset.promotionId,

    collectionId:
      asset.collectionId,

    priority:
      campaignPriority
  });
}
    }
  }

  return {
    workspaceId,
    generatedAt:
      now.toISOString(),

    banners,
    stories,
    reels
  };
}