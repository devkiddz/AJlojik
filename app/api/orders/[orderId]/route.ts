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

export const dynamic =
  'force-dynamic';

export const revalidate =
  0;

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      orderId: string;
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
          status: 401
        }
      );
    }

    const workspaceId =
      request.nextUrl.searchParams
        .get('workspaceId')
        ?.trim() ??
      '';

    if (!workspaceId) {
      return NextResponse.json(
        {
          error:
            'workspaceId is required.'
        },
        {
          status: 400
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
            true
        },
        select: {
          id: true
        }
      });

    if (!membership) {
      return NextResponse.json(
        {
          error:
            'Workspace access is required.'
        },
        {
          status: 403
        }
      );
    }

    const {
      orderId
    } =
      await context.params;

    const order =
      await DeliveryRepository.getCustomerOrder(
        session.user.id,
        workspaceId,
        orderId
      );

    if (!order) {
      return NextResponse.json(
        {
          error:
            'Order not found.'
        },
        {
          status: 404
        }
      );
    }

    return NextResponse.json({
      order
    });
  } catch (error) {
    return deliveryErrorResponse(
      error,
      'Unable to load the order.'
    );
  }
}
