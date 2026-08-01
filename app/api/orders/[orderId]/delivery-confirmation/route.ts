import {
  headers
} from 'next/headers';

import {
  NextRequest,
  NextResponse
} from 'next/server';

import {
  DeliveryRepository,
  deliveryErrorResponse
} from '@/features/delivery-runtime';

import {
  auth
} from '@/lib/auth';

import {
  prisma
} from '@/lib/prisma';

export async function POST(
  request:
    NextRequest,
  context: {
    params:
      Promise<{
        orderId:
          string;
      }>;
  }
) {
  try {
    const session =
      await auth.api.getSession({
        headers:
          await headers()
      });

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error:
            'Authentication is required.'
        },
        {
          status:
            401
        }
      );
    }

    const body =
      (await request.json()) as {
        workspaceId?:
          unknown;
        note?:
          unknown;
      };

    const workspaceId =
      typeof body.workspaceId ===
      'string'
        ? body.workspaceId.trim()
        : '';

    if (!workspaceId) {
      return NextResponse.json(
        {
          error:
            'workspaceId is required.'
        },
        {
          status:
            400
        }
      );
    }

    const membership =
      await prisma.workspaceMembership.findFirst({
        where: {
          workspaceId,
          userId:
            session.user.id,
          active:
            true,
          workspace: {
            active:
              true
          }
        },
        select: {
          id:
            true
        }
      });

    if (!membership) {
      return NextResponse.json(
        {
          error:
            'Workspace access is required.'
        },
        {
          status:
            403
        }
      );
    }

    const {
      orderId
    } =
      await context.params;

    const order =
      await DeliveryRepository.confirmCustomerDelivery(
        session.user.id,
        {
          workspaceId,
          orderId,
          note:
            typeof body.note ===
            'string'
              ? body.note
                  .trim()
                  .slice(
                    0,
                    1000
                  )
              : null
        }
      );

    return NextResponse.json({
      order
    });
  } catch (
    error
  ) {
    return deliveryErrorResponse(
      error,
      'Unable to confirm successful delivery.'
    );
  }
}
