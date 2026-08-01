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
        token?: unknown;
      };

    const session =
      await DeliveryRepository.activateHandover(
        typeof body.token ===
        'string'
          ? body.token
          : ''
      );

    return NextResponse.json({
      session
    });
  } catch (error) {
    return deliveryErrorResponse(
      error,
      'Unable to activate rider access.'
    );
  }
}
