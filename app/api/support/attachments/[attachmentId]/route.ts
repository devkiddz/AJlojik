import {
  get
} from '@vercel/blob';

import {
  NextRequest,
  NextResponse
} from 'next/server';

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

type RouteContext = {
  params: Promise<{
    attachmentId: string;
  }>;
};

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
  request: NextRequest,
  routeContext: RouteContext
) {
  const session =
    await auth.api.getSession({
      headers:
        request.headers
    });

  if (
    !session?.user?.id
  ) {
    return errorResponse(
      'Authentication is required.',
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

  const runtimeState =
    await getUserWorkspaces(
      session.user.id,
      requestedWorkspaceId
    );

  const workspace =
    runtimeState.activeWorkspace;

  if (!workspace) {
    return errorResponse(
      'An active workspace is required.',
      401
    );
  }

  const {
    attachmentId
  } =
    await routeContext.params;

  const attachment =
    await prisma
      .communicationAttachment
      .findFirst({
        where: {
          id:
            attachmentId,
          status:
            'READY',
          message: {
            conversation: {
              workspaceId:
                workspace.id,
              supportCase: {
                isNot:
                  null
              }
            }
          }
        },
        select: {
          fileName:
            true,
          mimeType:
            true,
          storageKey:
            true,
          message: {
            select: {
              conversation: {
                select: {
                  supportCase: {
                    select: {
                      customerId:
                        true
                    }
                  }
                }
              }
            }
          }
        }
      });

  if (!attachment) {
    return errorResponse(
      'The attachment could not be found.',
      404
    );
  }

  const supportCase =
    attachment
      .message
      .conversation
      .supportCase;

  const customerAccess =
    supportCase
      ?.customerId ===
    session.user.id;

  const operatorRole =
    workspace.membership.role;

  const operatorAccess =
    operatorRole ===
      'SUPPORT' ||
    operatorRole ===
      'MODERATOR' ||
    operatorRole ===
      'MANAGER' ||
    operatorRole ===
      'ADMIN' ||
    operatorRole ===
      'OWNER' ||
    operatorRole ===
      'SUPER_ADMIN';

  if (
    !customerAccess &&
    !operatorAccess
  ) {
    return errorResponse(
      'You do not have access to this attachment.',
      403
    );
  }

  const result =
    await get(
      attachment.storageKey,
      {
        access:
          'private'
      }
    );

  if (
    !result ||
    !result.stream
  ) {
    return errorResponse(
      'The attachment is unavailable.',
      404
    );
  }

  const inline =
    attachment.mimeType
      .startsWith(
        'image/'
      ) ||
    attachment.mimeType ===
      'application/pdf';

  return new Response(
    result.stream,
    {
      headers: {
        'Content-Type':
          attachment.mimeType,
        'Content-Disposition':
          `${inline ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(
            attachment.fileName
          )}`,
        'Cache-Control':
          'private, max-age=60',
        'X-Content-Type-Options':
          'nosniff'
      }
    }
  );
}