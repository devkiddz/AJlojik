import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { goBackExperience } from '@/features/experience-stack/services/go-back-experience';
import { auth } from '@/lib/auth';

type BackHistoryBody = {
  workspaceId?: string;
};

async function getAuthenticatedUserId(): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  return session?.user?.id ?? null;
}

export async function POST(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();

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

    const body = (await request.json()) as BackHistoryBody;

    if (!body.workspaceId) {
      return NextResponse.json(
        {
          error: 'workspaceId is required.'
        },
        {
          status: 400
        }
      );
    }

    const result = await goBackExperience({
      userId,
      workspaceId: body.workspaceId
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to go back in Experience History:', error);

    return NextResponse.json(
      {
        error: 'Unable to restore the previous experience.'
      },
      {
        status: 500
      }
    );
  }
}