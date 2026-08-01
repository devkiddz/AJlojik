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
            'Delivery handover authority is required.'
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

    const handover =
      await DeliveryRepository.issueHandover(
        access.session.user.id,
        {
          workspaceId,
          deliveryId,
          origin:
            request.nextUrl.origin
        }
      );

    return NextResponse.json(
      handover
    );
  } catch (error) {
    return deliveryErrorResponse(
      error,
      'Unable to issue rider handover access.'
    );
  }
}
