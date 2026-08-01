import {
  NextResponse
} from 'next/server';

import {
  IntelligenceActionService,
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
      actionId:
        string;
    }>;
};

export async function POST(
  request:
    Request,
  context:
    RouteContext
) {
  try {
    const {
      resolutionId,
      actionId
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

    return NextResponse.json({
      action:
        await IntelligenceActionService.apply(
          access,
          resolutionId,
          actionId
        )
    });
  } catch (
    error
  ) {
    return assistantErrorResponse(
      error,
      'Could not apply the Intelligence action.'
    );
  }
}
