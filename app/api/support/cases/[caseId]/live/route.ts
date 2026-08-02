import {
  NextRequest,
  NextResponse
} from 'next/server';

import {
  getCustomerSupportCase
} from '@/features/support/server/supportRepository';

import {
  createSupportLiveStreamResponse
} from '@/features/support/server/supportLiveStream';

import {
  leaveSupportLivePresence,
  setSupportLiveTyping,
  touchSupportLivePresence
} from '@/features/support/server/supportLivePresenceRepository';

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

export const revalidate = 0;
export const runtime = 'nodejs';
export const maxDuration = 60;

type RouteContext = {
  params: Promise<{
    caseId: string;
  }>;
};

async function resolveContext(
  request: NextRequest
) {
  const session =
    await auth.api.getSession({
      headers: request.headers
    });

  if (!session?.user?.id) {
    return null;
  }

  const requestedWorkspaceId =
    request.nextUrl.searchParams
      .get('workspaceId')
      ?.trim() ||
    request.cookies.get(
      ACTIVE_WORKSPACE_COOKIE
    )?.value ||
    null;

  const runtimeState =
    await getUserWorkspaces(
      session.user.id,
      requestedWorkspaceId
    );

  if (
    !runtimeState.activeWorkspace
  ) {
    return null;
  }

  return {
    userId: session.user.id,
    workspaceId:
      runtimeState.activeWorkspace.id
  };
}

function errorResponse(
  message: string,
  status: number
) {
  return NextResponse.json(
    {
      error: message
    },
    {
      status,
      headers: {
        'Cache-Control':
          'private, no-store, max-age=0'
      }
    }
  );
}

export async function GET(
  request: NextRequest,
  routeContext: RouteContext
) {
  const context =
    await resolveContext(request);

  if (!context) {
    return errorResponse(
      'Authentication and an active workspace are required.',
      401
    );
  }

  const { caseId } =
    await routeContext.params;

  const supportCase =
    await getCustomerSupportCase(
      caseId,
      context.userId,
      context.workspaceId
    );

  if (!supportCase) {
    return errorResponse(
      'The Support Case could not be found.',
      404
    );
  }

  await touchSupportLivePresence({
    workspaceId:
      context.workspaceId,
    caseId,
    conversationId:
      supportCase.conversationId,
    userId:
      context.userId,
    audience:
      'CUSTOMER'
  });

  return createSupportLiveStreamResponse(
    request,
    {
      workspaceId:
        context.workspaceId,
      caseId,
      actorId:
        context.userId,
      audience:
        'CUSTOMER'
    }
  );
}

export async function POST(
  request: NextRequest,
  routeContext: RouteContext
) {
  const context =
    await resolveContext(request);

  if (!context) {
    return errorResponse(
      'Authentication and an active workspace are required.',
      401
    );
  }

  const { caseId } =
    await routeContext.params;

  const supportCase =
    await getCustomerSupportCase(
      caseId,
      context.userId,
      context.workspaceId
    );

  if (!supportCase) {
    return errorResponse(
      'The Support Case could not be found.',
      404
    );
  }

  let body:
    Record<string, unknown>;

  try {
    body =
      (await request.json()) as
        Record<string, unknown>;
  } catch {
    return errorResponse(
      'A valid live Support action is required.',
      400
    );
  }

  const action =
    String(
      body.action ?? ''
    );

  const input = {
    workspaceId:
      context.workspaceId,
    caseId,
    conversationId:
      supportCase.conversationId,
    userId:
      context.userId,
    audience:
      'CUSTOMER' as const
  };

  if (action === 'heartbeat') {
    await touchSupportLivePresence(
      input
    );
  } else if (
    action === 'typing'
  ) {
    await setSupportLiveTyping({
      ...input,
      typing:
        body.typing === true
    });
  } else if (
    action === 'leave'
  ) {
    await leaveSupportLivePresence(
      input
    );
  } else {
    return errorResponse(
      'Unsupported live Support action.',
      400
    );
  }

  return NextResponse.json(
    {
      ok: true
    },
    {
      headers: {
        'Cache-Control':
          'private, no-store, max-age=0'
      }
    }
  );
}
