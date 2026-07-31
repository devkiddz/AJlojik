import type {
  CommerceCapabilities,
  CommerceMode
} from './commerceModeTypes';

export function resolveCommerceCapabilities(
  mode: CommerceMode,
  options?: {
    vendorApplicationsOpen?: boolean;
  }
): CommerceCapabilities {
  const marketplaceEnabled = mode === 'MULTI_VENDOR';

  return {
    mode,

    marketplaceEnabled,
    vendorDirectoryVisible: marketplaceEnabled,
    vendorStorefrontsVisible: marketplaceEnabled,
    vendorApplicationsAllowed:
      marketplaceEnabled &&
      Boolean(options?.vendorApplicationsOpen),
    vendorStudioAllowed: marketplaceEnabled,
    vendorPublishingAllowed: marketplaceEnabled,
    vendorCatalogVisible: marketplaceEnabled,
    vendorCollectionsVisible: marketplaceEnabled,
    vendorPromotionsVisible: marketplaceEnabled,
    vendorCampaignsVisible: marketplaceEnabled,

    platformCatalogVisible: true
  };
}
