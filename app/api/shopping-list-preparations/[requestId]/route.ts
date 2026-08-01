import {
  NextRequest,
  NextResponse
} from 'next/server';

import { PreparationRepository } from '@/features/shopping-list-preparation/preparationRepository';
import { preparationErrorResponse } from '@/features/shopping-list-preparation/preparationRouteResponse';
import { requirePreparationCustomer } from '@/features/shopping-list-preparation/preparationAuthorization';

export const dynamic =
  'force-dynamic';

export const revalidate =
  0;

export async function GET(
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

    const access =
      await requirePreparationCustomer(
        request.headers
      );

    const preparation =
      await PreparationRepository.getCustomerRequest(
        access.userId,
        requestId
      );

    if (!preparation) {
      return NextResponse.json(
        {
          error:
            'Preparation request not found.'
        },
        {
          status: 404
        }
      );
    }

    return NextResponse.json(
      {
        preparation
      },
      {
        headers: {
          'Cache-Control':
            'no-store'
        }
      }
    );
  } catch (error) {
    return preparationErrorResponse(
      error,
      'Unable to load the preparation request.'
    );
  }
}
