import {
  NextRequest,
  NextResponse
} from 'next/server';

import {
  getAdminApiAccess
} from '@/features/admin/auth/adminPermissions';
import {
  getSupportIntelligenceSnapshot
} from '@/features/support/server/supportIntelligenceService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type RouteContext = {
  params: Promise<{
    caseId: string;
  }>;
};

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
    return response(
      {
        error:
          'Support access is required.'
      },
      403
    );
  }

  const { caseId } =
    await routeContext.params;
  const snapshot =
    await getSupportIntelligenceSnapshot(
      caseId,
      access.membership.workspace.id
    );

  return snapshot
    ? response(snapshot)
    : response(
        {
          error:
            'The Support Case could not be found.'
        },
        404
      );
}
