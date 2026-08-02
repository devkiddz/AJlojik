import {
  NextRequest,
  NextResponse
} from 'next/server';

import {
  getAdminApiAccess
} from '@/features/admin/auth/adminPermissions';

import {
  getSupportLiveRuntimeDiagnostics,
  pruneSupportLiveRuntime
} from '@/features/support/server/supportLiveMaintenance';

export const dynamic =
  'force-dynamic';

export const revalidate = 0;
export const runtime = 'nodejs';

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

export async function GET(
  request: NextRequest
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
    return response(
      {
        error:
          'Support access is required.'
      },
      403
    );
  }

  return response(
    await getSupportLiveRuntimeDiagnostics(
      access.membership.workspace.id
    )
  );
}

export async function POST(
  request: NextRequest
) {
  const access =
    await getAdminApiAccess(
      request.headers
    );

  if (
    !access ||
    !access.permissions.has(
      'support:resolve'
    )
  ) {
    return response(
      {
        error:
          'Support resolution permission is required.'
      },
      403
    );
  }

  let body:
    Record<string, unknown>;

  try {
    body =
      (await request.json()) as
        Record<string, unknown>;
  } catch {
    return response(
      {
        error:
          'A valid Support live maintenance action is required.'
      },
      400
    );
  }

  if (
    String(
      body.action ?? ''
    ) !== 'prune'
  ) {
    return response(
      {
        error:
          'Unsupported Support live maintenance action.'
      },
      400
    );
  }

  const workspaceId =
    access.membership.workspace.id;

  const result =
    await pruneSupportLiveRuntime({
      workspaceId
    });

  return response({
    result,
    diagnostics:
      await getSupportLiveRuntimeDiagnostics(
        workspaceId
      )
  });
}
