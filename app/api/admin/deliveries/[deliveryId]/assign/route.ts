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

export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{
      deliveryId: string;
    }>;
  }
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
        'delivery:update:routine'
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Delivery update authority is required.'
        },
        {
          status: 403
        }
      );
    }

    const {
      deliveryId
    } =
      await context.params;

    const body =
      (await request.json()) as {
        workspaceId?: unknown;
        dispatcherId?: unknown;
        dispatcherName?: unknown;
        dispatcherPhone?: unknown;
        estimatedArrival?: unknown;
      };

    const workspaceId =
      typeof body.workspaceId ===
      'string'
        ? body.workspaceId.trim()
        : '';

    if (
      !workspaceId ||
      workspaceId !==
        access.membership.workspaceId
    ) {
      return NextResponse.json(
        {
          error:
            'A valid active workspace is required.'
        },
        {
          status: 403
        }
      );
    }

    const estimatedArrival =
      typeof body.estimatedArrival ===
        'string' &&
      body.estimatedArrival
        ? new Date(
            body.estimatedArrival
          )
        : null;

    if (
      estimatedArrival &&
      Number.isNaN(
        estimatedArrival.getTime()
      )
    ) {
      return NextResponse.json(
        {
          error:
            'The estimated arrival date is invalid.'
        },
        {
          status: 422
        }
      );
    }

    const delivery =
      await DeliveryRepository.assign(
        access.session.user.id,
        {
          workspaceId,
          deliveryId,
          dispatcherId:
            typeof body.dispatcherId ===
            'string'
              ? body.dispatcherId.trim() ||
                null
              : null,
          dispatcherName:
            typeof body.dispatcherName ===
            'string'
              ? body.dispatcherName
              : null,
          dispatcherPhone:
            typeof body.dispatcherPhone ===
            'string'
              ? body.dispatcherPhone
              : null,
          estimatedArrival
        }
      );

    return NextResponse.json({
      delivery
    });
  } catch (error) {
    return deliveryErrorResponse(
      error,
      'Unable to assign the delivery.'
    );
  }
}
