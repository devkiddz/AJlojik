import {
  NextResponse
} from 'next/server';

import {
  IntelligenceRepository,
  readJsonObject,
  requireText,
  resolveIntelligenceApiAccess
} from '@/features/intelligence';

import {
  assistantErrorResponse
} from '@/features/ai-assistance/server/assistantRouteResponse';

type RouteContext = {
  params:
    Promise<{
      resolutionId:
        string;
    }>;
};

export async function GET(
  request:
    Request,
  context:
    RouteContext
) {
  try {
    const {
      resolutionId
    } =
      await context.params;

    const url =
      new URL(
        request.url
      );

    const access =
      await resolveIntelligenceApiAccess(
        request,
        {
          audience:
            requireText(
              url.searchParams.get(
                'audience'
              ),
              'Audience',
              20
            ) as
              'customer' |
              'admin' |
              'vendor',
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
      resolution:
        await IntelligenceRepository.read(
          access,
          resolutionId
        )
    });
  } catch (
    error
  ) {
    return assistantErrorResponse(
      error,
      'Could not read the Intelligence resolution.'
    );
  }
}

export async function PATCH(
  request:
    Request,
  context:
    RouteContext
) {
  try {
    const {
      resolutionId
    } =
      await context.params;

    const body =
      await readJsonObject(
        request
      );

    const access =
      await resolveIntelligenceApiAccess(
        request,
        {
          audience:
            requireText(
              body.audience,
              'Audience',
              20
            ) as
              'customer' |
              'admin' |
              'vendor',
          workspaceId:
            requireText(
              body.workspaceId,
              'Workspace',
              200
            ),
          vendorProfileId:
            typeof body.vendorProfileId ===
              'string'
              ? body.vendorProfileId
              : null
        }
      );

    const operation =
      requireText(
        body.operation,
        'Operation',
        30
      );

    if (
      operation !==
        'DISMISS' &&
      operation !==
        'ARCHIVE'
    ) {
      throw new Error(
        'Supported operations are DISMISS and ARCHIVE.'
      );
    }

    return NextResponse.json({
      resolution:
        await IntelligenceRepository.transition(
          access,
          resolutionId,
          operation ===
            'DISMISS'
            ? 'DISMISSED'
            : 'ARCHIVED',
          {
            detail:
              typeof body.detail ===
                'string'
                ? body.detail
                : undefined
          }
        )
    });
  } catch (
    error
  ) {
    return assistantErrorResponse(
      error,
      'Could not update the Intelligence resolution.'
    );
  }
}
