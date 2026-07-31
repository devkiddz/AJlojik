import {
  headers
} from 'next/headers';

import {
  NextResponse
} from 'next/server';

import {
  getWorkspaceCommerceProjection
} from '@/features/feed-experience/runtime/getWorkspaceCommerceProjection';

import {
  auth
} from '@/lib/auth';

export const dynamic =
  'force-dynamic';

export async function GET(
  request: Request
) {
  const session =
    await auth.api.getSession({
      headers:
        await headers()
    });

  const userId =
    session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      {
        error:
          'Authentication required.'
      },
      {
        status: 401
      }
    );
  }

  const requestUrl =
    new URL(
      request.url
    );

  const workspaceId =
    requestUrl.searchParams
      .get('workspaceId')
      ?.trim();

  if (!workspaceId) {
    return NextResponse.json(
      {
        error:
          'A workspace ID is required.'
      },
      {
        status: 400
      }
    );
  }

  try {
    const projection =
      await getWorkspaceCommerceProjection({
        userId:
          String(userId),

        workspaceId
      });

    if (!projection) {
      return NextResponse.json(
        {
          error:
            'Workspace access was not found.'
        },
        {
          status: 403
        }
      );
    }

    return NextResponse.json(
      {
        projection
      },
      {
        headers: {
          'Cache-Control':
            'private, no-store, max-age=0'
        }
      }
    );
  } catch (error) {
    console.error(
      '[experience-runtime]',
      error
    );

    return NextResponse.json(
      {
        error:
          'The commerce experience could not be prepared.'
      },
      {
        status: 500
      }
    );
  }
}