import {
  NextRequest,
  NextResponse
} from 'next/server';

import { PreparationRepository } from '@/features/shopping-list-preparation/preparationRepository';
import { preparationErrorResponse } from '@/features/shopping-list-preparation/preparationRouteResponse';
import { requirePreparationCustomer } from '@/features/shopping-list-preparation/preparationAuthorization';

export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{
      requestId: string;
    }>;
  }
) {
  try {
    const {
      requestId
    } =
      await context.params;

    const body =
      (await request.json()) as {
        decision?: unknown;
        note?: unknown;
      };

    const decision =
      body.decision ===
        'APPROVED' ||
      body.decision ===
        'CHANGES_REQUESTED' ||
      body.decision ===
        'CANCELLED'
        ? body.decision
        : null;

    if (!decision) {
      return NextResponse.json(
        {
          error:
            'A valid preparation decision is required.'
        },
        {
          status: 400
        }
      );
    }

    const access =
      await requirePreparationCustomer(
        request.headers
      );

    const preparation =
      await PreparationRepository.decideRequest(
        access.userId,
        {
          requestId,
          decision,
          note:
            typeof body.note ===
            'string'
              ? body.note
                  .trim()
                  .slice(
                    0,
                    1000
                  )
              : null
        }
      );

    return NextResponse.json({
      preparation
    });
  } catch (error) {
    return preparationErrorResponse(
      error,
      'Unable to save the preparation decision.'
    );
  }
}
