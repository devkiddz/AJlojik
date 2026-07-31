import {
  cookies,
  headers
} from 'next/headers';

import { NextResponse } from 'next/server';

import {
  ACTIVE_WORKSPACE_COOKIE,
  ACTIVE_WORKSPACE_COOKIE_MAX_AGE
} from '@/features/workspace/workspaceConstants';

import {
  getGuestWorkspaceRuntime,
  getUserWorkspaces
} from '@/features/workspace/services/get-user-workspaces';

import { auth } from '@/lib/auth';

const WORKSPACE_CACHE_CONTROL =
  'no-store, no-cache, must-revalidate, proxy-revalidate';

function setWorkspaceCookie(
  response: NextResponse,
  workspaceId: string
) {
  response.cookies.set({
    name: ACTIVE_WORKSPACE_COOKIE,
    value: workspaceId,

    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',

    path: '/',
    maxAge: ACTIVE_WORKSPACE_COOKIE_MAX_AGE
  });
}

async function getAuthenticatedUserId() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  return session?.user?.id ?? null;
}

export async function GET() {
  try {
    const userId =
      await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        await getGuestWorkspaceRuntime(),
        {
          headers: {
            'Cache-Control': WORKSPACE_CACHE_CONTROL
          }
        }
      );
    }

    const cookieStore = await cookies();

    const preferredWorkspaceId =
      cookieStore.get(
        ACTIVE_WORKSPACE_COOKIE
      )?.value ?? null;

    const runtime = await getUserWorkspaces(
      userId,
      preferredWorkspaceId
    );

    const response =
      NextResponse.json(runtime);

    response.headers.set(
      'Cache-Control',
      WORKSPACE_CACHE_CONTROL
    );

    if (runtime.activeWorkspace) {
      setWorkspaceCookie(
        response,
        runtime.activeWorkspace.id
      );
    }

    return response;
  } catch (error) {
    console.error(
      'Failed to load workspace runtime:',
      error
    );

    return NextResponse.json(
      {
        error:
          'Unable to load workspace runtime.'
      },
      {
        status: 500
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId =
      await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        {
          error: 'Authentication is required.'
        },
        {
          status: 401
        }
      );
    }

    const body = (await request
      .json()
      .catch(() => null)) as {
      workspaceId?: unknown;
    } | null;

    const workspaceId =
      typeof body?.workspaceId === 'string'
        ? body.workspaceId.trim()
        : '';

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

    const runtime = await getUserWorkspaces(
      userId,
      workspaceId
    );

    if (
      runtime.activeWorkspace?.id !== workspaceId
    ) {
      return NextResponse.json(
        {
          error:
            'The selected workspace is unavailable.'
        },
        {
          status: 404
        }
      );
    }

    const response =
      NextResponse.json(runtime);

    response.headers.set(
      'Cache-Control',
      WORKSPACE_CACHE_CONTROL
    );

    setWorkspaceCookie(
      response,
      workspaceId
    );

    return response;
  } catch (error) {
    console.error(
      'Failed to switch workspace:',
      error
    );

    return NextResponse.json(
      {
        error:
          'Unable to switch workspace.'
      },
      {
        status: 500
      }
    );
  }
}