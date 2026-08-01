import {
  NextRequest,
  NextResponse
} from 'next/server';

import { PreparationRepository } from '@/features/shopping-list-preparation/preparationRepository';
import { preparationErrorResponse } from '@/features/shopping-list-preparation/preparationRouteResponse';
import { requirePreparationStaff } from '@/features/shopping-list-preparation/preparationAuthorization';

export const dynamic =
  'force-dynamic';

export const revalidate =
  0;

export async function GET(
  request: NextRequest
) {
  try {
    const query =
      request.nextUrl.searchParams
        .get('q')
        ?.trim() ??
      '';

    const access =
      await requirePreparationStaff(
        request.headers,
        'manage'
      );

    const variants =
      await PreparationRepository.searchVariants(
        access.membership
          .workspaceId,
        query
      );

    return NextResponse.json(
      {
        variants
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
      'Unable to search replacement products.'
    );
  }
}
