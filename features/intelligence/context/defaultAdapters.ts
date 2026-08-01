import type {
  IntelligenceContextAdapter,
  IntelligenceContextRequest
} from './contextContracts';

export const identityContextAdapter:
  IntelligenceContextAdapter = {
    id:
      'identity',
    section:
      'identity',
    supports:
      () =>
        true,
    async resolve(
      request
    ) {
      return {
        section:
          'identity',
        data: {
          audience:
            request.audience,
          workspaceId:
            request.workspaceId,
          userId:
            request.userId,
          vendorProfileId:
            request.vendorProfileId ??
            null,
          permissions: [
            ...request.permissions
          ]
        }
      };
    }
  };

export const runtimeExperienceContextAdapter:
  IntelligenceContextAdapter = {
    id:
      'runtime-experience',
    section:
      'experience',
    supports(
      request
    ) {
      return Boolean(
        request.runtime
      );
    },
    async resolve(
      request
    ) {
      const runtime =
        request.runtime ??
        {};

      return {
        section:
          'experience',
        data: {
          route:
            runtime.route ??
            null,
          productId:
            runtime.productId ??
            null,
          category:
            runtime.category ??
            null,
          collectionId:
            runtime.collectionId ??
            null,
          campaignId:
            runtime.campaignId ??
            null,
          intent:
            runtime.intent ??
            null,
          mode:
            runtime.mode ??
            null,
          experienceEntryId:
            runtime.experienceEntryId ??
            null
        },
        references: {
          productIds:
            runtime.productId
              ? [
                  runtime.productId
                ]
              : [],
          categoryIds:
            runtime.category
              ? [
                  runtime.category
                ]
              : [],
          campaignIds:
            runtime.campaignId
              ? [
                  runtime.campaignId
                ]
              : []
        }
      };
    }
  };

export const audienceOperationsContextAdapter:
  IntelligenceContextAdapter = {
    id:
      'audience-operations',
    section:
      'operations',
    supports:
      () =>
        true,
    async resolve(
      request:
        IntelligenceContextRequest
    ) {
      return {
        section:
          'operations',
        data: {
          audience:
            request.audience,
          canManageExperience:
            request.permissions.has(
              'experience:manage'
            ),
          canViewAnalytics:
            request.permissions.has(
              'analytics:view'
            ),
          canViewVendor:
            request.permissions.has(
              'vendor:view'
            ),
          resolutionType:
            request.resolutionType ??
            null
        }
      };
    }
  };

export const defaultIntelligenceContextAdapters:
  IntelligenceContextAdapter[] = [
    identityContextAdapter,
    runtimeExperienceContextAdapter,
    audienceOperationsContextAdapter
  ];
