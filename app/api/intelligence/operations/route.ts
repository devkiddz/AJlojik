import {
  NextResponse
} from 'next/server';

import {
  requireText,
  resolveIntelligenceApiAccess
} from '@/features/intelligence/api';

import {
  resolveOperationsSnapshot
} from '@/features/intelligence/operations/server';

import {
  assistantErrorResponse
} from '@/features/ai-assistance/server/assistantRouteResponse';

export async function GET(
  request:
    Request
) {
  try {
    const url =
      new URL(
        request.url
      );

    const audience =
      requireText(
        url.searchParams.get(
          'audience'
        ),
        'Audience',
        20
      ) as
        'admin' |
        'vendor';

    if (
      audience !==
        'admin' &&
      audience !==
        'vendor'
    ) {
      throw new Error(
        'Operational Intelligence requires Admin or Vendor scope.'
      );
    }

    const access =
      await resolveIntelligenceApiAccess(
        request,
        {
          audience,
          workspaceId:
            requireText(
              url.searchParams.get(
                'workspaceId'
              ),
              'Workspace',
              200
            ),
          vendorProfileId:
            url.searchParams.get(
              'vendorProfileId'
            )
        }
      );

    return NextResponse.json({
      snapshot:
        await resolveOperationsSnapshot(
          access
        )
    });
  } catch (
    error
  ) {
    return assistantErrorResponse(
      error,
      'Could not resolve operational Intelligence.'
    );
  }
}
