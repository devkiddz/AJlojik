import {
  NextRequest,
  NextResponse
} from 'next/server';

import type {
  AIAssistantAudience,
  AIAssistantBridgeActionType,
  AIAssistantBridgeOptions,
  AIAssistantCampaignType,
  AIAssistantTodoPriority
} from '@/features/ai-assistance/contracts';

import {
  resolveAssistantAccess
} from '@/features/ai-assistance/server/assistantAccess';

import {
  applyAssistantAction
} from '@/features/ai-assistance/server/assistantActionBridge';

import {
  assistantErrorResponse,
  AssistantRuntimeError
} from '@/features/ai-assistance/server/assistantRouteResponse';

const audiences =
  new Set<AIAssistantAudience>([
    'customer',
    'admin',
    'vendor'
  ]);

const actionTypes =
  new Set<AIAssistantBridgeActionType>([
    'SHOPPING_LIST_CREATE',
    'ADMIN_TODO_CREATE',
    'PRODUCT_DRAFT_CREATE',
    'PRODUCT_REVISION_SUBMIT',
    'CAMPAIGN_DRAFT_CREATE'
  ]);

function text(
  value:
    unknown
) {
  return typeof value ===
    'string'
    ? value.trim()
    : '';
}

function objectValue(
  value:
    unknown
): Record<string, unknown> {
  return value &&
    typeof value ===
      'object' &&
    !Array.isArray(
      value
    )
    ? value as
        Record<string, unknown>
    : {};
}

function stringArray(
  value:
    unknown
) {
  return Array.isArray(
    value
  )
    ? [
        ...new Set(
          value
            .filter(
              (
                item
              ): item is string =>
                typeof item ===
                'string'
            )
            .map(
              item =>
                item.trim()
            )
            .filter(
              Boolean
            )
        )
      ]
    : [];
}

function optionsForAction(
  actionType:
    AIAssistantBridgeActionType,
  value:
    unknown
): AIAssistantBridgeOptions {
  const options =
    objectValue(
      value
    );

  switch (
    actionType
  ) {
    case 'SHOPPING_LIST_CREATE':
      return {
        title:
          text(
            options.title
          ),
        description:
          text(
            options.description
          ),
        productIds:
          stringArray(
            options.productIds
          )
      };

    case 'ADMIN_TODO_CREATE': {
      const priority =
        text(
          options.priority
        );

      return {
        title:
          text(
            options.title
          ),
        description:
          text(
            options.description
          ),
        priority:
          (
            [
              'LOW',
              'MEDIUM',
              'HIGH',
              'URGENT'
            ].includes(
              priority
            )
              ? priority
              : 'MEDIUM'
          ) as
            AIAssistantTodoPriority
      };
    }

    case 'PRODUCT_DRAFT_CREATE':
      return {
        name:
          text(
            options.name
          ),
        shortDescription:
          text(
            options.shortDescription
          ),
        longDescription:
          text(
            options.longDescription
          ),
        estimatedDelivery:
          text(
            options.estimatedDelivery
          ) ||
          null,
        tags:
          stringArray(
            options.tags
          )
      };

    case 'PRODUCT_REVISION_SUBMIT':
      return {
        productId:
          text(
            options.productId
          ),
        reason:
          text(
            options.reason
          )
      };

    case 'CAMPAIGN_DRAFT_CREATE': {
      const campaignType =
        text(
          options.campaignType
        );

      return {
        title:
          text(
            options.title
          ),
        description:
          text(
            options.description
          ),
        campaignType:
          (
            [
              'BANNER',
              'STORY',
              'REEL'
            ].includes(
              campaignType
            )
              ? campaignType
              : 'BANNER'
          ) as
            AIAssistantCampaignType,
        productIds:
          stringArray(
            options.productIds
          )
      };
    }
  }
}

export async function POST(
  request:
    NextRequest,
  context: {
    params:
      Promise<{
        messageId:
          string;
      }>;
  }
) {
  try {
    const body =
      (await request.json()) as {
        audience?:
          unknown;
        workspaceId?:
          unknown;
        vendorProfileId?:
          unknown;
        actionType?:
          unknown;
        options?:
          unknown;
      };

    const audience =
      text(
        body.audience
      );

    const actionType =
      text(
        body.actionType
      );

    if (
      !audiences.has(
        audience as
          AIAssistantAudience
      )
    ) {
      throw new AssistantRuntimeError(
        'A valid assistant audience is required.',
        422
      );
    }

    if (
      !actionTypes.has(
        actionType as
          AIAssistantBridgeActionType
      )
    ) {
      throw new AssistantRuntimeError(
        'A valid governed action is required.',
        422
      );
    }

    const access =
      await resolveAssistantAccess(
        request.headers,
        {
          audience:
            audience as
              AIAssistantAudience,
          workspaceId:
            text(
              body.workspaceId
            ),
          vendorProfileId:
            text(
              body.vendorProfileId
            ) ||
            null
        }
      );

    const {
      messageId
    } =
      await context.params;

    const application =
      await applyAssistantAction(
        access,
        {
          messageId,
          actionType:
            actionType as
              AIAssistantBridgeActionType,
          options:
            optionsForAction(
              actionType as
                AIAssistantBridgeActionType,
              body.options
            )
        }
      );

    return NextResponse.json(
      {
        application
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
      'Unable to apply the intelligence action.'
    );
  }
}
