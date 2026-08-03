import {
  NextRequest,
  NextResponse
} from 'next/server';

import {
  resolveSupportGuideQuestion
} from '@/features/support/server/supportGuideService';

import type {
  SupportGuideRequest
} from '@/features/support/supportGuideTypes';

import {
  getUserWorkspaces
} from '@/features/workspace/services/get-user-workspaces';

import {
  ACTIVE_WORKSPACE_COOKIE
} from '@/features/workspace/workspaceConstants';

import {
  auth
} from '@/lib/auth';

export const dynamic =
  'force-dynamic';

export const revalidate =
  0;

export const runtime =
  'nodejs';

function response(
  data: unknown,
  status = 200
) {
  return NextResponse.json(
    data,
    {
      status,
      headers: {
        'Cache-Control':
          'private, no-store, max-age=0'
      }
    }
  );
}

export async function POST(
  request: NextRequest
) {
  const session =
    await auth.api.getSession({
      headers:
        request.headers
    });

  if (
    !session?.user?.id
  ) {
    return response(
      {
        error:
          'Sign in to use AJ Support Intelligence.'
      },
      401
    );
  }

  const requestedWorkspaceId =
    request.nextUrl
      .searchParams
      .get(
        'workspaceId'
      )
      ?.trim() ||
    request.cookies.get(
      ACTIVE_WORKSPACE_COOKIE
    )?.value ||
    null;

  const runtime =
    await getUserWorkspaces(
      session.user.id,
      requestedWorkspaceId
    );

  if (
    !runtime.activeWorkspace
  ) {
    return response(
      {
        error:
          'An active workspace is required.'
      },
      401
    );
  }

  try {
    const payload =
      (await request.json()) as
        Partial<
          SupportGuideRequest
        >;

    return response(
      await resolveSupportGuideQuestion({
        workspaceId:
          runtime
            .activeWorkspace
            .id,
        question:
          typeof payload.question ===
          'string'
            ? payload.question
            : '',
        pathname:
          typeof payload.pathname ===
          'string'
            ? payload.pathname
            : null
      })
    );
  } catch (cause) {
    return response(
      {
        error:
          cause instanceof Error
            ? cause.message
            : 'AJ Support Intelligence could not answer this question.'
      },
      400
    );
  }
}
