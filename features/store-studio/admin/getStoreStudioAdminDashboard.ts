import 'server-only';

import { prisma } from '@/lib/prisma';

import type {
  StoreStudioAdminCampaign,
  StoreStudioAdminDashboardData
} from './storeStudioAdminTypes';

function mapCampaignType(value: 'BANNER' | 'STORY' | 'REEL') {
  return value.toLowerCase() as StoreStudioAdminCampaign['type'];
}
function mapStatus(value: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'REJECTED') {
  return value.toLowerCase().replaceAll('_', '-') as StoreStudioAdminCampaign['status'];
}
function mapPlacementTier(value: 'STANDARD' | 'FEATURED' | 'PREMIUM' | 'SPONSORED') {
  return value.toLowerCase() as StoreStudioAdminCampaign['placementTier'];
}
function mapMediaType(value: 'IMAGE' | 'VIDEO') {
  return value.toLowerCase() as 'image' | 'video';
}

export async function getStoreStudioAdminDashboard(workspaceId: string): Promise<StoreStudioAdminDashboardData> {
  const [workspace, campaignRecords, products, promotions, collectionRecords, media] = await Promise.all([
    prisma.workspace.findUniqueOrThrow({
      where: { id: workspaceId },
      select: { id: true, name: true, mode: true }
    }),
    prisma.storeStudioCampaign.findMany({
      where: { workspaceId },
      include: {
        vendor: { select: { name: true } },
        vendorProfile: { select: { name: true } },
        assets: {
          orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
          include: {
            mediaAsset: { select: { metadata: true } },
            mobileMediaAsset: { select: { metadata: true } },
            coverMediaAsset: { select: { metadata: true } },
            posterMediaAsset: { select: { metadata: true } }
          }
        }
      },
      orderBy: [{ active: 'desc' }, { adminWeight: 'desc' }, { requestedPriority: 'desc' }, { updatedAt: 'desc' }]
    }),
    prisma.product.findMany({
      where: { workspaceId },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        active: true,
        category: { select: { label: true } },
        vendorProfile: { select: { name: true } },
        images: { orderBy: [{ primary: 'desc' }, { position: 'asc' }], take: 1, select: { url: true } },
        variants: { where: { active: true }, include: { inventory: true } }
      },
      orderBy: { name: 'asc' },
      take: 500
    }),
    prisma.promotion.findMany({
      where: { workspaceId },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        active: true,
        bannerMediaAsset: { select: { secureUrl: true } },
        _count: { select: { products: true } }
      },
      orderBy: [{ priority: 'desc' }, { title: 'asc' }],
      take: 200
    }),
    prisma.storeCollection.findMany({
      where: { workspaceId },
      select: {
        id: true,
        title: true,
        status: true,
        active: true,
        coverMediaAsset: { select: { secureUrl: true } },
        _count: { select: { products: true } }
      },
      orderBy: [{ priority: 'desc' }, { title: 'asc' }],
      take: 200
    }),
    prisma.mediaAsset.findMany({
      where: { workspaceId, status: 'ACTIVE', resourceType: { in: ['IMAGE', 'VIDEO'] } },
      select: {
        id: true,
        secureUrl: true,
        resourceType: true,
        displayName: true,
        originalFilename: true,
        metadata: true
      },
      orderBy: { createdAt: 'desc' },
      take: 240
    })
  ]);

  const productDestinationMap = new Map(
    products.map(product => [
      product.id,
      {
        id: product.id,
        name: product.name,
        imageUrl: product.images[0]?.url ?? null
      }
    ] as const)
  );
  const promotionDestinationMap = new Map(
    promotions.map(promotion => [
      promotion.id,
      {
        id: promotion.id,
        title: promotion.title,
        imageUrl: promotion.bannerMediaAsset?.secureUrl ?? null
      }
    ] as const)
  );
  const collectionDestinationMap = new Map(
    collectionRecords.map(collection => [
      collection.id,
      {
        id: collection.id,
        title: collection.title,
        imageUrl: collection.coverMediaAsset?.secureUrl ?? null
      }
    ] as const)
  );

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
      mediaAssetMetadata: asset.mediaAsset?.metadata,
      mobileMediaAssetId: asset.mobileMediaAssetId,
      mobileMediaAssetMetadata: asset.mobileMediaAsset?.metadata,
      coverMediaAssetId: asset.coverMediaAssetId,
      coverMediaAssetMetadata: asset.coverMediaAsset?.metadata,
      posterMediaAssetId: asset.posterMediaAssetId,
      posterMediaAssetMetadata: asset.posterMediaAsset?.metadata,
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
      product: asset.productId
        ? productDestinationMap.get(asset.productId) ?? null
        : null,
      promotion: asset.promotionId
        ? promotionDestinationMap.get(asset.promotionId) ?? null
        : null,
      collection: asset.collectionId
        ? collectionDestinationMap.get(asset.collectionId) ?? null
        : null,
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
    products: products.map(product => {
      const available = product.variants.reduce((sum, variant) => sum + Math.max(0, (variant.inventory?.quantity ?? 0) - (variant.inventory?.reserved ?? 0)), 0);
      return {
        id: product.id,
        label: product.name,
        href: `/store?product=${encodeURIComponent(product.id)}`,
        imageUrl: product.images[0]?.url ?? null,
        description: `${product.category.label}${product.vendorProfile ? ` · ${product.vendorProfile.name}` : ''} · ${available} available`,
        available: product.status === 'PUBLISHED' && product.active && available > 0
      };
    }),
    promotions: promotions.map(promotion => ({
      id: promotion.id,
      label: promotion.title,
      href: `/promos/${promotion.slug}`,
      imageUrl: promotion.bannerMediaAsset?.secureUrl ?? null,
      description: `${promotion._count.products} products · ${promotion.status.replaceAll('_', ' ')}`,
      available: promotion.status === 'PUBLISHED' && promotion.active
    })),
    collections: collectionRecords.map(collection => ({
      id: collection.id,
      label: collection.title,
      href: `/store?collection=${encodeURIComponent(collection.id)}`,
      imageUrl: collection.coverMediaAsset?.secureUrl ?? null,
      description: `${collection._count.products} products · ${collection.status.replaceAll('_', ' ')}`,
      available: collection.status === 'PUBLISHED' && collection.active
    })),
    media: media.map(asset => ({
      id: asset.id,
      secureUrl: asset.secureUrl,
      resourceType: mapMediaType(asset.resourceType as 'IMAGE' | 'VIDEO'),
      displayName: asset.displayName,
      originalFilename: asset.originalFilename,
      metadata: asset.metadata
    })),
    metrics: {
      total: campaigns.length,
      live: campaigns.filter(campaign => campaign.status === 'active').length,
      scheduled: campaigns.filter(campaign => campaign.status === 'scheduled').length,
      drafts: campaigns.filter(campaign => campaign.status === 'draft').length,
      awaitingReview: campaigns.filter(campaign => campaign.status === 'pending-review').length,
      paused: campaigns.filter(campaign => campaign.status === 'paused').length,
      rejected: campaigns.filter(campaign => campaign.status === 'rejected').length,
      inactive: campaigns.filter(campaign => !campaign.active).length,
      banners: campaigns.filter(campaign => campaign.type === 'banner').length,
      stories: campaigns.filter(campaign => campaign.type === 'story').length,
      reels: campaigns.filter(campaign => campaign.type === 'reel').length
    }
  };
}
