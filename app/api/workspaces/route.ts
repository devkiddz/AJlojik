import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { getUserWorkspaces } from '@/features/workspace/services/get-user-workspaces';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const userId = session?.user?.id;

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

    const runtime = await getUserWorkspaces(userId);

    return NextResponse.json(runtime);
  } catch (error) {
    console.error(
      'Failed to load workspace runtime:',
      error
    );

    return NextResponse.json(
      {
        error: 'Unable to load workspace runtime.'
      },
      {
        status: 500
      }
    );
  }
}