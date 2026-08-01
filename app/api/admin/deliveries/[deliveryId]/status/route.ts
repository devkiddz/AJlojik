import {
  NextRequest,
  NextResponse
} from 'next/server';

import type {
  DeliveryStatus
} from '@/lib/generated/prisma/client';

import {
  getAdminApiAccess
} from '@/features/admin/auth/adminPermissions';

import {
  DeliveryRepository,
  deliveryErrorResponse
} from '@/features/delivery-runtime';

const statuses =
  new Set<DeliveryStatus>([
    'ASSIGNED',
    'BARCODE_SCANNED',
    'PICKED_UP',
    'IN_TRANSIT',
    'ARRIVED',
    'DELIVERED',
    'FAILED',
    'CANCELLED'
  ]);

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
        nextStatus?: unknown;
        note?: unknown;
      };

    const workspaceId =
      typeof body.workspaceId ===
      'string'
        ? body.workspaceId.trim()
        : '';

    const nextStatus =
      typeof body.nextStatus ===
      'string'
        ? body.nextStatus
        : '';

    if (
      !workspaceId ||
      workspaceId !==
        access.membership.workspaceId ||
      !statuses.has(
        nextStatus as DeliveryStatus
      )
    ) {
      return NextResponse.json(
        {
          error:
            'A valid workspace and next delivery status are required.'
        },
        {
          status: 422
        }
      );
    }

    const delivery =
      await DeliveryRepository.adminTransition(
        access.session.user.id,
        {
          workspaceId,
          deliveryId,
          nextStatus:
            nextStatus as DeliveryStatus,
          note:
            typeof body.note ===
            'string'
              ? body.note
                  .trim()
                  .slice(0, 1000)
              : null
        }
      );

    return NextResponse.json({
      delivery
    });
  } catch (error) {
    return deliveryErrorResponse(
      error,
      'Unable to update the delivery status.'
    );
  }
}
