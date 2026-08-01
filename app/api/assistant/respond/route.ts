import {
  NextRequest,
  NextResponse
} from 'next/server';

import type {
  AIAssistantAudience,
  AIAssistantRuntimeContext
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

function text(
  value:
    unknown
) {
  return typeof value ===
    'string'
    ? value.trim()
    : '';
}

export async function POST(
  request:
    NextRequest
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
        sessionId?:
          unknown;
        message?:
          unknown;
        context?:
          unknown;
      };

    const audienceValue =
      text(
        body.audience
      );

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

    const workspaceId =
      text(
        body.workspaceId
      );

    const vendorProfileId =
      text(
        body.vendorProfileId
      ) ||
      null;

    const rawContext =
      body.context &&
      typeof body.context ===
        'object' &&
      !Array.isArray(
        body.context
      )
        ? body.context as
            Record<
              string,
              unknown
            >
        : {};

    const context:
      AIAssistantRuntimeContext = {
      workspaceId,
      vendorProfileId,
      productId:
        text(
          rawContext.productId
        ) ||
        null,
      category:
        text(
          rawContext.category
        ) ||
        null,
      intent:
        text(
          rawContext.intent
        ) ||
        null,
      mode:
        text(
          rawContext.mode
        ) ||
        null
    };

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

    const session =
      await AssistantRepository.respond(
        access,
        {
          sessionId:
            text(
              body.sessionId
            ) ||
            null,
          message:
            text(
              body.message
            ),
          context
        }
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
      'Unable to create the intelligence response.'
    );
  }
}
