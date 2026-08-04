'use client';

/* AJ_LIVING_INTELLIGENCE_UNIFIED_WORKSPACE */

import type {
  ReactNode
} from 'react';

import type {
  AIAssistantAudience,
  AIAssistantRuntimeContext
} from '@/features/ai-assistance/contracts';

type IntelligenceWorkspaceProps = {
  audience:
    AIAssistantAudience;
  workspaceId:
    string;
  vendorProfileId?:
    string |
    null;
  sessionId?:
    string |
    null;
  runtime?:
    Partial<
      AIAssistantRuntimeContext
    >;
  conversation:
    ReactNode;
};

export function IntelligenceWorkspace({
  conversation
}: IntelligenceWorkspaceProps) {
  return (
    <div className="min-h-[38rem]">
      {
        conversation
      }
    </div>
  );
}
