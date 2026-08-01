import type {
  AIAssistantRuntimeContext
} from '@/features/ai-assistance/contracts';

import type {
  AssistantAccess
} from '@/features/ai-assistance/server/assistantAccess';

import type {
  IntelligenceContextRequest
} from './contextContracts';

export function contextRequestFromAssistantAccess(
  access:
    AssistantAccess,
  runtime:
    AIAssistantRuntimeContext & {
      route?: string | null;
      collectionId?: string | null;
      campaignId?: string | null;
      experienceEntryId?: string | null;
    }
): IntelligenceContextRequest {
  return {
    audience:
      access.audience,
    workspaceId:
      access.workspaceId,
    userId:
      access.userId,
    vendorProfileId:
      access.vendorProfileId,
    permissions:
      access.permissions,
    runtime: {
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
    }
  };
}
