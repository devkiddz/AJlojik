import {
  NextRequest,
  NextResponse
} from 'next/server';

import type {
  AIAssistantAudience,
  AIAssistantFeedbackValue
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

const feedbackValues =
  new Set<AIAssistantFeedbackValue>([
    'HELPFUL',
    'NOT_HELPFUL',
    'APPLIED',
    'DISMISSED'
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
        feedback?:
          unknown;
      };

    const audience =
      text(
        body.audience
      );

    const feedback =
      text(
        body.feedback
      );

    if (
      !audiences.has(
        audience as
          AIAssistantAudience
      ) ||
      !feedbackValues.has(
        feedback as
          AIAssistantFeedbackValue
      )
    ) {
      return NextResponse.json(
        {
          error:
            'A valid audience and feedback value are required.'
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

    const result =
      await AssistantRepository.updateFeedback(
        access,
        messageId,
        feedback as
          AIAssistantFeedbackValue
      );

    return NextResponse.json(
      result
    );
  } catch (
    error
  ) {
    return assistantErrorResponse(
      error,
      'Unable to record intelligence feedback.'
    );
  }
}
