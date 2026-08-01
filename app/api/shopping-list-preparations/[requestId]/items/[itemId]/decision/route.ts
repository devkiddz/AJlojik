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
      itemId: string;
    }>;
  }
) {
  try {
    const {
      requestId,
      itemId
    } =
      await context.params;

    const body =
      (await request.json()) as {
        decision?: unknown;
        customerNote?: unknown;
      };

    const decision =
      body.decision ===
        'APPROVED' ||
      body.decision ===
        'REJECTED'
        ? body.decision
        : null;

    if (!decision) {
      return NextResponse.json(
        {
          error:
            'A valid item decision is required.'
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
      await PreparationRepository.decideItem(
        access.userId,
        {
          requestId,
          itemId,
          decision,
          customerNote:
            typeof body.customerNote ===
            'string'
              ? body.customerNote
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
      'Unable to save the item decision.'
    );
  }
}
