import {
  NextRequest,
  NextResponse
} from 'next/server';

import {
  SUPPORT_CASE_CATEGORIES,
  SUPPORT_CASE_PRIORITIES
} from '@/features/support';
import {
  getCustomerSupportCases
} from '@/features/support/server/supportRepository';
import {
  SupportServiceError,
  createSupportCase
} from '@/features/support/server/supportService';
import {
  getUserWorkspaces
} from '@/features/workspace/services/get-user-workspaces';
import {
  ACTIVE_WORKSPACE_COOKIE
} from '@/features/workspace/workspaceConstants';
import type {
  SupportCaseCategory,
  SupportCasePriority
} from '@/lib/generated/prisma/client';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function resolveContext(
  request: NextRequest
) {
  const session = await auth.api.getSession({
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

  const runtime = await getUserWorkspaces(
    session.user.id,
    requestedWorkspaceId
  );

  if (!runtime.activeWorkspace) {
    return null;
  }

  return {
    userId: session.user.id,
    workspaceId: runtime.activeWorkspace.id
  };
}

function response(
  data: unknown,
  status = 200
) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Cache-Control':
        'private, no-store, max-age=0'
    }
  });
}

function serviceStatus(
  error: SupportServiceError
) {
  if (error.code === 'INVALID_INPUT') {
    return 400;
  }

  if (error.code === 'ACCESS_DENIED') {
    return 403;
  }

  if (
    error.code === 'CONTEXT_NOT_FOUND' ||
    error.code === 'CASE_NOT_FOUND'
  ) {
    return 404;
  }

  return 409;
}

export async function GET(
  request: NextRequest
) {
  const context =
    await resolveContext(request);

  if (!context) {
    return response(
      {
        error:
          'Authentication and an active workspace are required.'
      },
      401
    );
  }

  return response(
    await getCustomerSupportCases(
      context.userId,
      context.workspaceId,
      100
    )
  );
}

export async function POST(
  request: NextRequest
) {
  try {
    const context =
      await resolveContext(request);

    if (!context) {
      return response(
        {
          error:
            'Authentication and an active workspace are required.'
        },
        401
      );
    }

    const body =
      (await request.json()) as
        Record<string, unknown>;
    const category = String(
      body.category ?? ''
    );
    const priority = String(
      body.priority ?? 'NORMAL'
    );

    if (
      !SUPPORT_CASE_CATEGORIES.some(
        value => value === category
      )
    ) {
      return response(
        {
          error:
            'A valid Support category is required.'
        },
        400
      );
    }

    if (
      !SUPPORT_CASE_PRIORITIES.some(
        value => value === priority
      )
    ) {
      return response(
        {
          error:
            'A valid Support priority is required.'
        },
        400
      );
    }

    return response(
      await createSupportCase({
        workspaceId:
          context.workspaceId,
        customerId: context.userId,
        category:
          category as SupportCaseCategory,
        priority:
          priority as SupportCasePriority,
        subject: String(
          body.subject ?? ''
        ),
        description: String(
          body.description ?? ''
        ),
        orderId:
          body.orderId === undefined
            ? null
            : String(body.orderId),
        deliveryId:
          body.deliveryId === undefined
            ? null
            : String(body.deliveryId),
        vendorProfileId:
          body.vendorProfileId ===
          undefined
            ? null
            : String(
                body.vendorProfileId
              )
      }),
      201
    );
  } catch (error) {
    if (
      error instanceof
      SupportServiceError
    ) {
      return response(
        {
          error: error.message,
          code: error.code
        },
        serviceStatus(error)
      );
    }

    console.error(
      'Support Case creation failed.',
      error
    );

    return response(
      {
        error:
          'AJ Logik could not create the Support Case.'
      },
      500
    );
  }
}
