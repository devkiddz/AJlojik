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
  assistantErrorResponse
} from '@/features/ai-assistance/server/assistantRouteResponse';

const audiences =
  new Set<AIAssistantAudience>([
    'customer',
    'admin',
    'vendor'
  ]);

export const dynamic =
  'force-dynamic';

export const revalidate =
  0;

export async function GET(
  request:
    NextRequest
) {
  try {
    const audienceValue =
      request.nextUrl.searchParams
        .get(
          'audience'
        )
        ?.trim() ??
      '';

    const workspaceId =
      request.nextUrl.searchParams
        .get(
          'workspaceId'
        )
        ?.trim() ??
      '';

    const vendorProfileId =
      request.nextUrl.searchParams
        .get(
          'vendorProfileId'
        )
        ?.trim() ??
      null;

    if (
      !audiences.has(
        audienceValue as
          AIAssistantAudience
      )
    ) {
      return NextResponse.json(
        {
          error:
            'A valid assistant audience is required.'
        },
        {
          status:
            422
        }
      );
    }

    const access =
      await resolveAssistantAccess(
        request.headers,
        {
          audience:
            audienceValue as
              AIAssistantAudience,
          workspaceId,
          vendorProfileId
        }
      );

    const sessions =
      await AssistantRepository.listSessions(
        access
      );

    return NextResponse.json(
      {
        access: {
          audience:
            access.audience,
          workspaceId:
            access.workspaceId,
          userId:
            access.userId,
          vendorProfileId:
            access.vendorProfileId,
          contextLabel:
            access.contextLabel
        },
        sessions
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
      'Unable to load intelligence sessions.'
    );
  }
}
