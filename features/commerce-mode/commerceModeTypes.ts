export type CommerceMode =
  | 'SINGLE_MERCHANT'
  | 'MULTI_VENDOR';

export type CommerceCapabilities = {
  mode: CommerceMode;

  marketplaceEnabled: boolean;
  vendorDirectoryVisible: boolean;
  vendorStorefrontsVisible: boolean;
  vendorApplicationsAllowed: boolean;
  vendorStudioAllowed: boolean;
  vendorPublishingAllowed: boolean;
  vendorCatalogVisible: boolean;
  vendorCollectionsVisible: boolean;
  vendorPromotionsVisible: boolean;
  vendorCampaignsVisible: boolean;

  platformCatalogVisible: true;
};

export type PublicCommerceWorkspace = {
  id: string;
  slug: string;
  name: string;
  mode: 'LIVE' | 'DEMO' | 'PRACTICE' | 'SANDBOX';
  commerceMode: CommerceMode;
  vendorApplicationsOpen: boolean;
  currency: string;
  timezone: string;
  capabilities: CommerceCapabilities;
};

export type CommerceModeDowngradeImpact = {
  activeVendors: number;
  vendorProducts: number;
  publishedVendorProducts: number;
  vendorCollections: number;
  publishedVendorCollections: number;
  vendorPromotions: number;
  publishedVendorPromotions: number;
  vendorCampaigns: number;
  liveVendorCampaigns: number;
  openVendorApprovals: number;
  vendorApplicationsOpen: boolean;
  requiresAcknowledgement: boolean;
};
