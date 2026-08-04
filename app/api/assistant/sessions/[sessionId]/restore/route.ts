import {
  NextRequest,
  NextResponse
} from 'next/server';

/* AJ_ASSISTANCE_WORKSPACE_STAGE_3_RESTORE_ROUTE */

import type {
  AIAssistantAudience
} from '@/features/ai-assistance/contracts';

import {
  resolveAssistantAccess
} from '@/features/ai-assistance/server/assistantAccess';

import {
  AssistantRepository
} from '@/features/ai-assistance/server/assistantRepository';

import {
  AssistantRuntimeError,
  assistantErrorResponse
} from '@/features/ai-assistance/server/assistantRouteResponse';

const audiences =
  new Set<AIAssistantAudience>([
    'customer',
    'admin',
    'vendor'
  ]);

function readAudience(
  request:
    NextRequest
) {
  const value =
    request.nextUrl.searchParams
      .get(
        'audience'
      )
      ?.trim() ??
    '';

  return audiences.has(
    value as
      AIAssistantAudience
  )
    ? value as
        AIAssistantAudience
    : null;
}

async function accessForRequest(
  request:
    NextRequest
) {
  const audience =
    readAudience(
      request
    );

  if (!audience) {
    throw new AssistantRuntimeError(
      'A valid assistant audience is required.',
      422
    );
  }

  return resolveAssistantAccess(
    request.headers,
    {
      audience,
      workspaceId:
        request.nextUrl.searchParams
          .get(
            'workspaceId'
          )
          ?.trim() ??
        '',
      vendorProfileId:
        request.nextUrl.searchParams
          .get(
            'vendorProfileId'
          )
          ?.trim() ??
        null
    }
  );
}

export const dynamic =
  'force-dynamic';

export const revalidate =
  0;

export async function POST(
  request:
    NextRequest,
  context: {
    params:
      Promise<{
        sessionId:
          string;
      }>;
  }
) {
  try {
    const access =
      await accessForRequest(
        request
      );

    const {
      sessionId
    } =
      await context.params;

    const body =
      (await request.json()) as {
        messageId?:
          unknown;
      };

    const messageId =
      typeof body.messageId ===
      'string'
        ? body.messageId.trim()
        : '';

    if (!messageId) {
      throw new AssistantRuntimeError(
        'Select a saved plan version to restore.',
        422
      );
    }

    const session =
      await AssistantRepository.restorePlan(
        access,
        sessionId,
        messageId
      );

    return NextResponse.json(
      {
        session
      },
      {
        headers: {
          'Cache-Control':
            'no-store'
        }
      }
    );
  } catch (
    error
  ) {
    return assistantErrorResponse(
      error,
      'Unable to restore the selected plan.'
    );
  }
}
