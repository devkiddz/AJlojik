import type {
  StoreStudioCampaignStatus,
  StoreStudioCampaignType,
  StoreStudioMediaType,
  StoreStudioPlacementTier
} from '../contracts';

export type StoreStudioAdminAsset = {
  id: string;
  campaignId: string;
  mediaType: StoreStudioMediaType;
  mediaUrl: string;
  mediaAssetId: string | null;
  mediaAssetMetadata?: unknown;
  mobileMediaAssetId: string | null;
  mobileMediaAssetMetadata?: unknown;
  coverMediaAssetId: string | null;
  coverMediaAssetMetadata?: unknown;
  posterMediaAssetId: string | null;
  posterMediaAssetMetadata?: unknown;
  mobileMediaUrl: string | null;
  coverUrl: string | null;
  posterUrl: string | null;
  eyebrow: string | null;
  title: string | null;
  description: string | null;
  actionLabel: string | null;
  actionHref: string | null;
  productId: string | null;
  promotionId: string | null;
  collectionId: string | null;
  product: { id: string; name: string; imageUrl: string | null } | null;
  promotion: { id: string; title: string; imageUrl: string | null } | null;
  collection: { id: string; title: string; imageUrl: string | null } | null;
  durationSeconds: number | null;
  autoplay: boolean;
  muted: boolean;
  position: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StoreStudioAdminCampaign = {
  id: string;
  workspaceId: string;
  vendorId: string | null;
  vendorName: string | null;
  type: StoreStudioCampaignType;
  status: StoreStudioCampaignStatus;
  placementTier: StoreStudioPlacementTier;
  title: string;
  description: string | null;
  startsAt: string | null;
  endsAt: string | null;
  requestedPriority: number;
  adminWeight: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  assets: StoreStudioAdminAsset[];
};

export type StoreStudioAdminMediaAsset = {
  id: string;
  secureUrl: string;
  resourceType: 'image' | 'video';
  displayName: string | null;
  originalFilename: string | null;
  metadata?: unknown;
};

export type StoreStudioDestinationOption = {
  id: string;
  label: string;
  href: string;
  imageUrl: string | null;
  description: string | null;
  available: boolean;
};

export type StoreStudioAdminDashboardData = {
  workspace: { id: string; name: string; mode: string };
  campaigns: StoreStudioAdminCampaign[];
  products: StoreStudioDestinationOption[];
  promotions: StoreStudioDestinationOption[];
  collections: StoreStudioDestinationOption[];
  media: StoreStudioAdminMediaAsset[];
  metrics: {
    total: number;
    live: number;
    scheduled: number;
    drafts: number;
    awaitingReview: number;
    paused: number;
    rejected: number;
    inactive: number;
    banners: number;
    stories: number;
    reels: number;
  };
};
