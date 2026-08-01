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
    const access =
      await requirePreparationStaff(
        request.headers,
        'view'
      );

    const requests =
      await PreparationRepository.listStaffRequests(
        access.membership
          .workspaceId
      );

    return NextResponse.json(
      {
        requests,
        workspace: {
          id:
            access.membership
              .workspaceId,
          name:
            access.membership
              .workspace.name
        }
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
      'Unable to load preparation operations.'
    );
  }
}
