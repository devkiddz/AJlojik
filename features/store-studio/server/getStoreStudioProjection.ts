import 'server-only';

import { resolveCommerceCapabilities } from '@/features/commerce-mode';
import { prisma } from '@/lib/prisma';
import {
  resolveStudioCroppedMedia
} from '@/features/studio-controls/cropMetadata';

import type {
  StoreStudioAction,
  StoreStudioProjection
} from '../contracts';

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

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { commerceMode: true }
  });

  const vendorCampaignsVisible = workspace
    ? resolveCommerceCapabilities(workspace.commerceMode)
        .vendorCampaignsVisible
    : false;

  const campaigns =
    await prisma.storeStudioCampaign.findMany({
      where: {
        workspaceId,
        active: true,

        status: {
          in: [
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
          },

          include: {
            mediaAsset: { select: { metadata: true } },
            mobileMediaAsset: { select: { metadata: true } },
            coverMediaAsset: { select: { metadata: true } },
            posterMediaAsset: { select: { metadata: true } }
          }
        },

        vendor: {
          select: { name: true }
        },
        vendorProfile: {
          select: { name: true, status: true, active: true }
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
    if (
      campaign.vendorProfileId &&
      (!vendorCampaignsVisible ||
        campaign.vendorProfile?.status !== 'ACTIVE' ||
        !campaign.vendorProfile.active)
    ) {
      continue;
    }
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
        const desktopMedia = resolveStudioCroppedMedia(
          asset.mediaUrl,
          asset.mediaAsset?.metadata,
          'banner-desktop'
        );
        const mobileMedia = asset.mobileMediaUrl
          ? resolveStudioCroppedMedia(
              asset.mobileMediaUrl,
              asset.mobileMediaAsset?.metadata,
              'banner-mobile'
            )
          : null;
        const posterMedia = asset.posterUrl
          ? resolveStudioCroppedMedia(
              asset.posterUrl,
              asset.posterMediaAsset?.metadata,
              'video-poster'
            )
          : null;

        banners.push({
          id: asset.id,
          campaignId: campaign.id,

          mediaType:
            asset.mediaType === 'VIDEO'
              ? 'video'
              : 'image',

          mediaUrl:
            desktopMedia.url,

          mobileMediaUrl:
            mobileMedia?.url ?? asset.mobileMediaUrl,

          posterUrl:
            posterMedia?.url ?? asset.posterUrl,

          desktopObjectPosition:
            desktopMedia.objectPosition,

          mobileObjectPosition:
            mobileMedia?.objectPosition,

          posterObjectPosition:
            posterMedia?.objectPosition,

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
        const storyMedia = resolveStudioCroppedMedia(
          asset.mediaUrl,
          asset.mediaAsset?.metadata,
          'story'
        );
        const coverSource =
          asset.coverUrl ?? asset.posterUrl ?? asset.mediaUrl;
        const coverMetadata =
          asset.coverMediaAsset?.metadata ??
          asset.posterMediaAsset?.metadata ??
          asset.mediaAsset?.metadata;
        const coverPurpose = asset.coverUrl
          ? 'story'
          : asset.posterUrl
            ? 'video-poster'
            : 'story';
        const storyCover = resolveStudioCroppedMedia(
          coverSource,
          coverMetadata,
          coverPurpose
        );
        const storyPoster = asset.posterUrl
          ? resolveStudioCroppedMedia(
              asset.posterUrl,
              asset.posterMediaAsset?.metadata,
              'video-poster'
            )
          : null;

        stories.push({
          id: asset.id,
          campaignId: campaign.id,
          workspaceId,

          vendorId:
            campaign.vendorProfileId ?? campaign.vendorId,

          vendorName:
            campaign.vendorProfile?.name ??
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
            storyMedia.url,

          coverUrl:
            storyCover.url,

          posterUrl:
            storyPoster?.url ?? asset.posterUrl,

          mediaObjectPosition:
            storyMedia.objectPosition,

          coverObjectPosition:
            storyCover.objectPosition,

          posterObjectPosition:
            storyPoster?.objectPosition,

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
        const reelPosterSource = asset.posterUrl ?? asset.coverUrl;
        const reelPoster = reelPosterSource
          ? resolveStudioCroppedMedia(
              reelPosterSource,
              asset.posterMediaAsset?.metadata ??
                asset.coverMediaAsset?.metadata,
              asset.posterMediaAsset ? 'video-poster' : 'reel-cover'
            )
          : null;

        reels.push({
          id: asset.id,
          campaignId: campaign.id,
          workspaceId,

          vendorId:
            campaign.vendorProfileId ?? campaign.vendorId,

          vendorName:
            campaign.vendorProfile?.name ??
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
            reelPoster?.url ?? reelPosterSource,

          posterObjectPosition:
            reelPoster?.objectPosition,

          durationMs:
            asset.durationSeconds &&
            asset.durationSeconds > 0
              ? asset.durationSeconds * 1_000
              : null,

          autoplay:
            asset.autoplay,

          action,

          detailHref: `/reels/${asset.id}`,

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