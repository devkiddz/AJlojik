import {
  NextRequest,
  NextResponse
} from 'next/server';

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

export async function GET(
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

    const session =
      await AssistantRepository.readSession(
        access,
        sessionId
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
      'Unable to load the intelligence session.'
    );
  }
}

export async function DELETE(
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

    const result =
      await AssistantRepository.archiveSession(
        access,
        sessionId
      );

    return NextResponse.json(
      result
    );
  } catch (
    error
  ) {
    return assistantErrorResponse(
      error,
      'Unable to archive the intelligence session.'
    );
  }
}
