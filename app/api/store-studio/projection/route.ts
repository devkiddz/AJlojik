import { NextResponse } from 'next/server';

import { getStoreStudioProjection } from '@/features/store-studio/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const workspaceId = url.searchParams.get('workspaceId')?.trim();

  if (!workspaceId) {
    return NextResponse.json(
      {
        error: 'workspaceId is required.'
      },
      {
        status: 400
      }
    );
  }

  const projection =
    await getStoreStudioProjection(workspaceId);

  return NextResponse.json({
    projection
  });
}
