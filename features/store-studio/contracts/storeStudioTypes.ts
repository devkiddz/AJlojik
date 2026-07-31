export type StoreStudioCampaignType = 'banner' | 'story' | 'reel';

export type StoreStudioCampaignStatus =
  | 'draft'
  | 'pending-review'
  | 'approved'
  | 'scheduled'
  | 'active'
  | 'paused'
  | 'expired'
  | 'rejected';

export type StoreStudioPlacementTier =
  | 'standard'
  | 'featured'
  | 'premium'
  | 'sponsored';

export type StoreStudioMediaType = 'image' | 'video';

export type StoreStudioAction = {
  label: string;
  href: string;
};

export type StoreStudioCampaignProjection = {
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
};

export type StoreStudioBannerSlideProjection = {
  id: string;
  campaignId: string;
  mediaType: StoreStudioMediaType;
  mediaUrl: string;
  mobileMediaUrl: string | null;
  posterUrl: string | null;
  desktopObjectPosition?: string;
  mobileObjectPosition?: string;
  posterObjectPosition?: string;
  eyebrow: string | null;
  title: string;
  description: string | null;
  primaryAction: StoreStudioAction | null;
  secondaryAction: StoreStudioAction | null;
  autoplay: boolean;
  durationMs: number;
  position: number;
};

export type StoreStudioStoryProjection = {
  id: string;
  campaignId: string;
  workspaceId: string;
  vendorId: string | null;
  vendorName: string | null;
  title: string;
  label: string | null;
  mediaType: StoreStudioMediaType;
  mediaUrl: string;
  coverUrl: string;
  posterUrl: string | null;
  mediaObjectPosition?: string;
  coverObjectPosition?: string;
  posterObjectPosition?: string;
  durationMs: number;
  action: StoreStudioAction | null;
  productIds: string[];
  promotionId: string | null;
  collectionId: string | null;
  priority: number;
};

export type StoreStudioReelProjection = {
  id: string;
  campaignId: string;
  workspaceId: string;
  vendorId: string | null;
  vendorName: string | null;
  title: string;
  caption: string | null;
  videoUrl: string;
  posterUrl: string | null;
  posterObjectPosition?: string;
  durationMs: number | null;
  autoplay: boolean;
  action: StoreStudioAction | null;
  detailHref: string | null;
  productId: string | null;
  promotionId: string | null;
  collectionId: string | null;
  priority: number;
};

export type StoreStudioEntitlementProjection = {
  workspaceId: string;
  vendorId: string | null;
  tier: 'basic' | 'growth' | 'premium' | 'enterprise';
  bannerSlots: number;
  activeStoryLimit: number;
  activeReelLimit: number;
  canSchedule: boolean;
  canUseVideo: boolean;
  canRequestFeaturedPlacement: boolean;
  canUseSponsoredPlacement: boolean;
};

export type StoreStudioProjection = {
  workspaceId: string;
  generatedAt: string;
  banners: StoreStudioBannerSlideProjection[];
  stories: StoreStudioStoryProjection[];
  reels: StoreStudioReelProjection[];
};
