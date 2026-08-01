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
      };

    const delivery =
      await DeliveryRepository.readSession(
        typeof body.sessionToken ===
        'string'
          ? body.sessionToken
          : ''
      );

    return NextResponse.json({
      delivery
    });
  } catch (error) {
    return deliveryErrorResponse(
      error,
      'Unable to restore the rider session.'
    );
  }
}
