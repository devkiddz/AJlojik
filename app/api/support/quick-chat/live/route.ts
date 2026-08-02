import {
  NextRequest,
  NextResponse
} from 'next/server';

import {
  createSupportLiveStreamResponse
} from '@/features/support/server/supportLiveStream';

import {
  getUserWorkspaces
} from '@/features/workspace/services/get-user-workspaces';

import {
  ACTIVE_WORKSPACE_COOKIE
} from '@/features/workspace/workspaceConstants';

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

export const runtime =
  'nodejs';

export const maxDuration =
  60;

async function resolveContext(
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
    return null;
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
    userId:
      session.user.id,
    workspaceId:
      runtimeState
        .activeWorkspace
        .id
  };
}

function errorResponse(
  message: string,
  status: number
) {
  return NextResponse.json(
    {
      error:
        message
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
  request: NextRequest
) {
  const context =
    await resolveContext(
      request
    );

  if (!context) {
    return errorResponse(
      'Authentication and an active workspace are required.',
      401
    );
  }

  const caseId =
    request.nextUrl
      .searchParams
      .get(
        'caseId'
      )
      ?.trim() ??
    '';

  if (!caseId) {
    return errorResponse(
      'A Support Case is required.',
      400
    );
  }

  const supportCase =
    await prisma.supportCase.findFirst({
      where: {
        id:
          caseId,
        customerId:
          context.userId,
        workspaceId:
          context.workspaceId
      },
      select: {
        id:
          true
      }
    });

  if (!supportCase) {
    return errorResponse(
      'The Support Case could not be found.',
      404
    );
  }

  return createSupportLiveStreamResponse(
    request,
    {
      workspaceId:
        context.workspaceId,
      caseId:
        supportCase.id,
      actorId:
        context.userId,
      audience:
        'CUSTOMER'
    }
  );
}
