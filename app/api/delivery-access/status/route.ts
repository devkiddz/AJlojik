import {
  NextRequest,
  NextResponse
} from 'next/server';

import type {
  DeliveryStatus
} from '@/lib/generated/prisma/client';

import {
  DeliveryRepository,
  deliveryErrorResponse
} from '@/features/delivery-runtime';

const statuses =
  new Set<DeliveryStatus>([
    'PICKED_UP',
    'IN_TRANSIT',
    'ARRIVED',
    'DELIVERED',
    'FAILED'
  ]);

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      (await request.json()) as {
        sessionToken?: unknown;
        nextStatus?: unknown;
        note?: unknown;
        latitude?: unknown;
        longitude?: unknown;
        accuracyMeters?: unknown;
      };

    const nextStatus =
      typeof body.nextStatus ===
      'string'
        ? body.nextStatus
        : '';

    if (
      !statuses.has(
        nextStatus as DeliveryStatus
      )
    ) {
      return NextResponse.json(
        {
          error:
            'A valid rider delivery status is required.'
        },
        {
          status: 422
        }
      );
    }

    const delivery =
      await DeliveryRepository.riderTransition(
        typeof body.sessionToken ===
        'string'
          ? body.sessionToken
          : '',
        {
          nextStatus:
            nextStatus as DeliveryStatus,
          note:
            typeof body.note ===
            'string'
              ? body.note
                  .trim()
                  .slice(0, 1000)
              : null,
          latitude:
            typeof body.latitude ===
            'number'
              ? body.latitude
              : null,
          longitude:
            typeof body.longitude ===
            'number'
              ? body.longitude
              : null,
          accuracyMeters:
            typeof body.accuracyMeters ===
            'number'
              ? body.accuracyMeters
              : null
        }
      );

    return NextResponse.json({
      delivery
    });
  } catch (error) {
    return deliveryErrorResponse(
      error,
      'Unable to update the rider delivery status.'
    );
  }
}
