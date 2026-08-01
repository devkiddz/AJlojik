import {
  NextRequest,
  NextResponse
} from 'next/server';

import type {
  ShoppingListPreparationStatus
} from '@/lib/generated/prisma/client';

import { PreparationRepository } from '@/features/shopping-list-preparation/preparationRepository';
import { preparationErrorResponse } from '@/features/shopping-list-preparation/preparationRouteResponse';
import { requirePreparationStaff } from '@/features/shopping-list-preparation/preparationAuthorization';

const ALLOWED_STATUSES =
  new Set<
    ShoppingListPreparationStatus
  >([
    'IN_PREPARATION',
    'AWAITING_CUSTOMER_APPROVAL',
    'READY_FOR_CHECKOUT',
    'COMPLETED',
    'CANCELLED'
  ]);

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
        nextStatus?: unknown;
        note?: unknown;
      };

    const nextStatus =
      typeof body.nextStatus ===
      'string'
        ? body.nextStatus
        : '';

    if (
      !ALLOWED_STATUSES.has(
        nextStatus as ShoppingListPreparationStatus
      )
    ) {
      return NextResponse.json(
        {
          error:
            'A valid preparation status is required.'
        },
        {
          status: 400
        }
      );
    }

    const access =
      await requirePreparationStaff(
        request.headers,
        'manage'
      );

    const preparation =
      await PreparationRepository.transition(
        access.session.user.id,
        {
          workspaceId:
            access.membership
              .workspaceId,
          requestId,
          nextStatus:
            nextStatus as ShoppingListPreparationStatus,
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
      'Unable to update the preparation status.'
    );
  }
}
