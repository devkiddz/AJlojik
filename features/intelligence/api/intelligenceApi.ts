import type {
  AIAssistantAudience
} from '@/features/ai-assistance/contracts';

import {
  resolveAssistantAccess
} from '@/features/ai-assistance/server/assistantAccess';

import {
  AssistantRuntimeError
} from '@/features/ai-assistance/server/assistantRouteResponse';

export type IntelligenceAccessBody = {
  audience:
    AIAssistantAudience;
  workspaceId:
    string;
  vendorProfileId?:
    string |
    null;
};

export async function resolveIntelligenceApiAccess(
  request:
    Request,
  input:
    IntelligenceAccessBody
) {
  return resolveAssistantAccess(
    request.headers,
    {
      audience:
        input.audience,
      workspaceId:
        input.workspaceId,
      vendorProfileId:
        input.vendorProfileId
    }
  );
}

export async function readJsonObject(
  request:
    Request
): Promise<Record<string, unknown>> {
  const value =
    await request.json().catch(
      () =>
        null
    );

  if (
    !value ||
    typeof value !==
      'object' ||
    Array.isArray(
      value
    )
  ) {
    throw new AssistantRuntimeError(
      'A valid JSON request body is required.',
      400
    );
  }

  return value as
    Record<string, unknown>;
}

export function requireText(
  value:
    unknown,
  label:
    string,
  maximum =
    2000
): string {
  if (
    typeof value !==
      'string' ||
    !value.trim()
  ) {
    throw new AssistantRuntimeError(
      `${label} is required.`,
      422
    );
  }

  return value
    .replace(
      /\s+/g,
      ' '
    )
    .trim()
    .slice(
      0,
      maximum
    );
}
