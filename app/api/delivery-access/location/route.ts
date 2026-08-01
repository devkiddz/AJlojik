import {
  NextRequest,
  NextResponse
} from 'next/server';

import {
  DeliveryRepository,
  deliveryErrorResponse
} from '@/features/delivery-runtime';

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      (await request.json()) as {
        sessionToken?: unknown;
        latitude?: unknown;
        longitude?: unknown;
        accuracyMeters?: unknown;
      };

    if (
      typeof body.latitude !==
        'number' ||
      typeof body.longitude !==
        'number'
    ) {
      return NextResponse.json(
        {
          error:
            'Latitude and longitude are required.'
        },
        {
          status: 422
        }
      );
    }

    const result =
      await DeliveryRepository.updateLocation(
        typeof body.sessionToken ===
        'string'
          ? body.sessionToken
          : '',
        {
          latitude:
            body.latitude,
          longitude:
            body.longitude,
          accuracyMeters:
            typeof body.accuracyMeters ===
            'number'
              ? body.accuracyMeters
              : null
        }
      );

    return NextResponse.json(
      result
    );
  } catch (error) {
    return deliveryErrorResponse(
      error,
      'Unable to record the rider location.'
    );
  }
}
