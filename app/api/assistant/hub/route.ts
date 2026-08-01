import {
  NextRequest,
  NextResponse
} from 'next/server';

import {
  resolveAssistantAccess
} from '@/features/ai-assistance/server/assistantAccess';

import {
  getLatestCustomerAssistantInsight
} from '@/features/ai-assistance/server/assistantHubRepository';

import {
  assistantErrorResponse
} from '@/features/ai-assistance/server/assistantRouteResponse';

export const dynamic =
  'force-dynamic';

export const revalidate =
  0;

export async function GET(
  request:
    NextRequest
) {
  try {
    const workspaceId =
      request.nextUrl.searchParams
        .get(
          'workspaceId'
        )
        ?.trim() ??
      '';

    const access =
      await resolveAssistantAccess(
        request.headers,
        {
          audience:
            'customer',
          workspaceId
        }
      );

    const insight =
      await getLatestCustomerAssistantInsight(
        access
      );

    return NextResponse.json(
      {
        insight
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
      'Unable to load the latest AJ Intelligence insight.'
    );
  }
}
