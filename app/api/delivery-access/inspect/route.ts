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

    const inspection =
      await DeliveryRepository.inspectHandover(
        typeof body.token ===
        'string'
          ? body.token
          : ''
      );

    return NextResponse.json({
      inspection
    });
  } catch (error) {
    return deliveryErrorResponse(
      error,
      'Unable to inspect rider handover access.'
    );
  }
}
