import {
  NextRequest,
  NextResponse
} from 'next/server';

import type {
  ShoppingListPreparationItemStatus
} from '@/lib/generated/prisma/client';

import { PreparationRepository } from '@/features/shopping-list-preparation/preparationRepository';
import { preparationErrorResponse } from '@/features/shopping-list-preparation/preparationRouteResponse';
import { requirePreparationStaff } from '@/features/shopping-list-preparation/preparationAuthorization';

const ALLOWED_ITEM_STATUSES =
  new Set<
    ShoppingListPreparationItemStatus
  >([
    'AVAILABLE',
    'PARTIALLY_AVAILABLE',
    'SUBSTITUTED',
    'PRICE_CHANGED',
    'UNAVAILABLE',
    'PREPARED',
    'REMOVED'
  ]);

export async function PATCH(
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
        status?: unknown;
        resolvedVariantId?: unknown;
        preparedQuantity?: unknown;
        quotedUnitPrice?: unknown;
        substitutionReason?: unknown;
        staffNote?: unknown;
      };

    const status =
      typeof body.status ===
      'string'
        ? body.status
        : '';

    if (
      !ALLOWED_ITEM_STATUSES.has(
        status as ShoppingListPreparationItemStatus
      )
    ) {
      return NextResponse.json(
        {
          error:
            'A valid preparation item status is required.'
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
      await PreparationRepository.resolveItem(
        access.session.user.id,
        {
          workspaceId:
            access.membership
              .workspaceId,
          requestId,
          itemId,
          status:
            status as ShoppingListPreparationItemStatus,
          ...(body.resolvedVariantId ===
          null
            ? {
                resolvedVariantId:
                  null
              }
            : typeof body.resolvedVariantId ===
                'string'
              ? {
                  resolvedVariantId:
                    body.resolvedVariantId
                      .trim()
                }
              : {}),
          ...(typeof body.preparedQuantity ===
          'number'
            ? {
                preparedQuantity:
                  body.preparedQuantity
              }
            : {}),
          ...(typeof body.quotedUnitPrice ===
          'number'
            ? {
                quotedUnitPrice:
                  body.quotedUnitPrice
              }
            : {}),
          substitutionReason:
            typeof body.substitutionReason ===
            'string'
              ? body.substitutionReason
                  .trim()
                  .slice(
                    0,
                    1000
                  )
              : null,
          staffNote:
            typeof body.staffNote ===
            'string'
              ? body.staffNote
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
      'Unable to resolve the preparation item.'
    );
  }
}
