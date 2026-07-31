import {
  headers
} from 'next/headers';

import {
  NextResponse
} from 'next/server';

import {
  auth
} from '@/lib/auth';

import {
  prisma
} from '@/lib/prisma';

type RecordProductViewBody = {
  productId?: unknown;
};

async function getAuthenticatedUserId(): Promise<string | null> {
  const session =
    await auth.api.getSession({
      headers: await headers()
    });

  return session?.user?.id ?? null;
}

export async function POST(
  request: Request
) {
  try {
    const userId =
      await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        {
          recorded: false,
          reason: 'unauthenticated'
        },
        {
          status: 401
        }
      );
    }

    const body = (await request
      .json()
      .catch(() => null)) as
      | RecordProductViewBody
      | null;

    const productId =
      typeof body?.productId ===
      'string'
        ? body.productId.trim()
        : '';

    if (!productId) {
      return NextResponse.json(
        {
          recorded: false,
          error:
            'A product ID is required.'
        },
        {
          status: 400
        }
      );
    }

    const productExists =
      await prisma.product.findFirst({
        where: {
          id: productId,
          active: true
        },
        select: {
          id: true
        }
      });

    if (!productExists) {
      return NextResponse.json(
        {
          recorded: false,
          error:
            'The selected product is unavailable.'
        },
        {
          status: 404
        }
      );
    }

    const viewedAt =
      new Date();

    await prisma.recentlyViewed.upsert({
      where: {
        userId_productId: {
          userId,
          productId
        }
      },

      create: {
        userId,
        productId,
        viewedAt
      },

      update: {
        viewedAt
      }
    });

    return NextResponse.json({
      recorded: true,
      productId,
      viewedAt:
        viewedAt.toISOString()
    });
  } catch (error) {
    console.error(
      'Failed to record product view:',
      error
    );

    return NextResponse.json(
      {
        recorded: false,
        error:
          'Unable to record this product view.'
      },
      {
        status: 500
      }
    );
  }
}