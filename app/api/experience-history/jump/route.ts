import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { jumpToExperience } from '@/features/experience-stack/services/jump-to-experience';
import { auth } from '@/lib/auth';

type JumpHistoryBody = {
  workspaceId?: string;
  entryId?: string;
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

    const body = (await request.json()) as JumpHistoryBody;

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

    if (!body.entryId) {
      return NextResponse.json(
        {
          error: 'entryId is required.'
        },
        {
          status: 400
        }
      );
    }

    const entry = await jumpToExperience({
      userId,
      workspaceId: body.workspaceId,
      entryId: body.entryId
    });

    if (!entry) {
      return NextResponse.json(
        {
          error: 'Experience History entry was not found.'
        },
        {
          status: 404
        }
      );
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Failed to jump to Experience History entry:', error);

    return NextResponse.json(
      {
        error: 'Unable to restore the selected experience.'
      },
      {
        status: 500
      }
    );
  }
}