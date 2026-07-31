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
  mobileMediaAssetId: string | null;
  coverMediaAssetId: string | null;
  posterMediaAssetId: string | null;
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
};

export type StoreStudioDestinationOption = {
  id: string;
  label: string;
  href: string;
};

export type StoreStudioAdminDashboardData = {
  workspace: {
    id: string;
    name: string;
    mode: string;
  };
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
    banners: number;
    stories: number;
    reels: number;
  };
};
