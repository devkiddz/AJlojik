import {
  NextRequest,
  NextResponse
} from 'next/server';

import {
  getAdminApiAccess
} from '@/features/admin/auth/adminPermissions';
import {
  getAgentSupportQueue
} from '@/features/support/server/supportRepository';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    await getAgentSupportQueue(
      access.membership.workspace.id,
      200
    )
  );
}
