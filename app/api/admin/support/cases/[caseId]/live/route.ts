import {
  NextRequest,
  NextResponse
} from 'next/server';

import {
  getAdminApiAccess
} from '@/features/admin/auth/adminPermissions';

import {
  getAgentSupportCase
} from '@/features/support/server/supportRepository';

import {
  createSupportLiveStreamResponse
} from '@/features/support/server/supportLiveStream';

import {
  leaveSupportLivePresence,
  setSupportLiveTyping,
  touchSupportLivePresence
} from '@/features/support/server/supportLivePresenceRepository';

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
  const access =
    await getAdminApiAccess(
      request.headers
    );

  if (
    !access ||
    !access.permissions.has(
      'support:view'
    )
  ) {
    return errorResponse(
      'Support access is required.',
      403
    );
  }

  const { caseId } =
    await routeContext.params;

  const workspaceId =
    access.membership.workspace.id;

  const supportCase =
    await getAgentSupportCase(
      caseId,
      workspaceId
    );

  if (!supportCase) {
    return errorResponse(
      'The Support Case could not be found.',
      404
    );
  }

  await touchSupportLivePresence({
    workspaceId,
    caseId,
    conversationId:
      supportCase.conversationId,
    userId:
      access.actor.id,
    audience:
      'AGENT'
  });

  return createSupportLiveStreamResponse(
    request,
    {
      workspaceId,
      caseId,
      actorId:
        access.actor.id,
      audience:
        'AGENT'
    }
  );
}

export async function POST(
  request: NextRequest,
  routeContext: RouteContext
) {
  const access =
    await getAdminApiAccess(
      request.headers
    );

  if (
    !access ||
    !access.permissions.has(
      'support:view'
    )
  ) {
    return errorResponse(
      'Support access is required.',
      403
    );
  }

  const { caseId } =
    await routeContext.params;

  const workspaceId =
    access.membership.workspace.id;

  const supportCase =
    await getAgentSupportCase(
      caseId,
      workspaceId
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
    workspaceId,
    caseId,
    conversationId:
      supportCase.conversationId,
    userId:
      access.actor.id,
    audience:
      'AGENT' as const
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
