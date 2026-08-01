import {
  NextRequest,
  NextResponse
} from 'next/server';

import {
  getAdminApiAccess
} from '@/features/admin/auth/adminPermissions';

import {
  DeliveryRepository,
  deliveryErrorResponse
} from '@/features/delivery-runtime';

export const dynamic =
  'force-dynamic';

export const revalidate =
  0;

export async function GET(
  request: NextRequest
) {
  try {
    const access =
      await getAdminApiAccess(
        request.headers
      );

    if (!access) {
      return NextResponse.json(
        {
          error:
            'Administrator authentication is required.'
        },
        {
          status: 401
        }
      );
    }

    if (
      !access.permissions.has(
        'delivery:view'
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Delivery access is required.'
        },
        {
          status: 403
        }
      );
    }

    const workspaceId =
      request.nextUrl.searchParams
        .get('workspaceId')
        ?.trim() ??
      access.membership.workspaceId;

    if (
      workspaceId !==
      access.membership.workspaceId
    ) {
      return NextResponse.json(
        {
          error:
            'The selected workspace is not available in this administrator session.'
        },
        {
          status: 403
        }
      );
    }

    const runtime =
      await DeliveryRepository.listAdmin(
        workspaceId
      );

    return NextResponse.json(
      runtime
    );
  } catch (error) {
    return deliveryErrorResponse(
      error,
      'Unable to load delivery operations.'
    );
  }
}
