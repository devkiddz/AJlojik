import 'server-only';

import { prisma } from '@/lib/prisma';

import type { StoreStudioAdminCampaign, StoreStudioAdminDashboardData } from './storeStudioAdminTypes';

function mapCampaignType(value: 'BANNER' | 'STORY' | 'REEL') { return value.toLowerCase() as StoreStudioAdminCampaign['type']; }
function mapStatus(value: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'REJECTED') { return value.toLowerCase().replaceAll('_', '-') as StoreStudioAdminCampaign['status']; }
function mapPlacementTier(value: 'STANDARD' | 'FEATURED' | 'PREMIUM' | 'SPONSORED') { return value.toLowerCase() as StoreStudioAdminCampaign['placementTier']; }
function mapMediaType(value: 'IMAGE' | 'VIDEO') { return value.toLowerCase() as 'image' | 'video'; }

export async function getStoreStudioAdminDashboard(workspaceId: string): Promise<StoreStudioAdminDashboardData> {
  const [workspace, campaignRecords, products, promotions, collectionRecords, media] = await Promise.all([
    prisma.workspace.findUniqueOrThrow({ where: { id: workspaceId }, select: { id: true, name: true, mode: true } }),
    prisma.storeStudioCampaign.findMany({
      where: { workspaceId, active: true },
      include: {
        vendor: { select: { name: true } },
        vendorProfile: { select: { name: true } },
        assets: { orderBy: [{ position: 'asc' }, { createdAt: 'asc' }] }
      },
      orderBy: [{ adminWeight: 'desc' }, { requestedPriority: 'desc' }, { updatedAt: 'desc' }]
    }),
    prisma.product.findMany({ where: { workspaceId, status: 'PUBLISHED', active: true }, select: { id: true, name: true, slug: true }, orderBy: { name: 'asc' }, take: 500 }),
    prisma.promotion.findMany({ where: { workspaceId, status: 'PUBLISHED', active: true }, select: { id: true, title: true, slug: true }, orderBy: [{ priority: 'desc' }, { title: 'asc' }], take: 200 }),
    prisma.storeCollection.findMany({ where: { workspaceId, status: 'PUBLISHED', active: true }, select: { id: true, title: true }, orderBy: [{ priority: 'desc' }, { title: 'asc' }], take: 200 }),
    prisma.mediaAsset.findMany({ where: { workspaceId, status: 'ACTIVE', resourceType: { in: ['IMAGE', 'VIDEO'] } }, select: { id: true, secureUrl: true, resourceType: true, displayName: true, originalFilename: true }, orderBy: { createdAt: 'desc' }, take: 240 })
  ]);

  const campaigns: StoreStudioAdminCampaign[] = campaignRecords.map(campaign => ({
    id: campaign.id,
    workspaceId: campaign.workspaceId,
    vendorId: campaign.vendorId,
    vendorName: campaign.vendorProfile?.name ?? campaign.vendor?.name ?? null,
    type: mapCampaignType(campaign.type),
    status: mapStatus(campaign.status),
    placementTier: mapPlacementTier(campaign.placementTier),
    title: campaign.title,
    description: campaign.description,
    startsAt: campaign.startsAt?.toISOString() ?? null,
    endsAt: campaign.endsAt?.toISOString() ?? null,
    requestedPriority: campaign.requestedPriority,
    adminWeight: campaign.adminWeight,
    active: campaign.active,
    createdAt: campaign.createdAt.toISOString(),
    updatedAt: campaign.updatedAt.toISOString(),
    assets: campaign.assets.map(asset => ({
      id: asset.id,
      campaignId: asset.campaignId,
      mediaType: mapMediaType(asset.mediaType),
      mediaUrl: asset.mediaUrl,
      mediaAssetId: asset.mediaAssetId,
      mobileMediaAssetId: asset.mobileMediaAssetId,
      coverMediaAssetId: asset.coverMediaAssetId,
      posterMediaAssetId: asset.posterMediaAssetId,
      mobileMediaUrl: asset.mobileMediaUrl,
      coverUrl: asset.coverUrl,
      posterUrl: asset.posterUrl,
      eyebrow: asset.eyebrow,
      title: asset.title,
      description: asset.description,
      actionLabel: asset.actionLabel,
      actionHref: asset.actionHref,
      productId: asset.productId,
      promotionId: asset.promotionId,
      collectionId: asset.collectionId,
      durationSeconds: asset.durationSeconds,
      autoplay: asset.autoplay,
      muted: asset.muted,
      position: asset.position,
      active: asset.active,
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString()
    }))
  }));

  return {
    workspace: { id: workspace.id, name: workspace.name, mode: workspace.mode },
    campaigns,
    products: products.map(product => ({ id: product.id, label: product.name, href: `/products/${product.slug}` })),
    promotions: promotions.map(promotion => ({ id: promotion.id, label: promotion.title, href: `/promos/${promotion.slug}` })),
    collections: collectionRecords.map(collection => ({ id: collection.id, label: collection.title, href: `/store?collection=${encodeURIComponent(collection.id)}` })),
    media: media.map(asset => ({ id: asset.id, secureUrl: asset.secureUrl, resourceType: mapMediaType(asset.resourceType as 'IMAGE' | 'VIDEO'), displayName: asset.displayName, originalFilename: asset.originalFilename })),
    metrics: {
      total: campaigns.length,
      live: campaigns.filter(campaign => campaign.status === 'active').length,
      scheduled: campaigns.filter(campaign => campaign.status === 'scheduled').length,
      drafts: campaigns.filter(campaign => campaign.status === 'draft').length,
      awaitingReview: campaigns.filter(campaign => campaign.status === 'pending-review').length,
      banners: campaigns.filter(campaign => campaign.type === 'banner').length,
      stories: campaigns.filter(campaign => campaign.type === 'story').length,
      reels: campaigns.filter(campaign => campaign.type === 'reel').length
    }
  };
}
