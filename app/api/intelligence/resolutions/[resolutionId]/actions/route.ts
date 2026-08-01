import {
  NextResponse
} from 'next/server';

import type {
  AIAssistantBridgeActionType,
  AIAssistantBridgeOptions
} from '@/features/ai-assistance/contracts';

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

    const options =
      body.options;

    if (
      !options ||
      typeof options !==
        'object' ||
      Array.isArray(
        options
      )
    ) {
      throw new Error(
        'Valid action options are required.'
      );
    }

    return NextResponse.json(
      {
        action:
          await IntelligenceActionService.prepare(
            access,
            resolutionId,
            {
              actionType:
                requireText(
                  body.actionType,
                  'Action type',
                  80
                ) as
                  AIAssistantBridgeActionType,
              messageId:
                requireText(
                  body.messageId,
                  'Assistant message',
                  200
                ),
              label:
                requireText(
                  body.label,
                  'Label',
                  160
                ),
              description:
                requireText(
                  body.description,
                  'Description'
                ),
              options:
                options as
                  AIAssistantBridgeOptions
            }
          )
      },
      {
        status:
          201
      }
    );
  } catch (
    error
  ) {
    return assistantErrorResponse(
      error,
      'Could not prepare the Intelligence action.'
    );
  }
}
