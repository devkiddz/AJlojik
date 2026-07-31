import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { updateExperienceHistorySettings } from '@/features/experience-stack/services/update-experience-history-settings';
import { auth } from '@/lib/auth';

import type { ExperienceHistoryRetention } from '@/lib/generated/prisma/client';

type UpdateHistorySettingsBody = {
  workspaceId?: string;

  enabled?: boolean;
  retention?: ExperienceHistoryRetention;
  maxEntries?: number;
};

async function getAuthenticatedUserId(): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  return session?.user?.id ?? null;
}

export async function PATCH(request: Request) {
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

    const body = (await request.json()) as UpdateHistorySettingsBody;

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

    if (
      body.enabled === undefined &&
      body.retention === undefined &&
      body.maxEntries === undefined
    ) {
      return NextResponse.json(
        {
          error: 'At least one history setting must be provided.'
        },
        {
          status: 400
        }
      );
    }

    const settings = await updateExperienceHistorySettings({
      userId,
      workspaceId: body.workspaceId,
      enabled: body.enabled,
      retention: body.retention,
      maxEntries: body.maxEntries
    });

    return NextResponse.json({
      enabled: settings.enabled,
      retention: settings.retention,
      maxEntries: settings.maxEntries
    });
  } catch (error) {
    console.error(
      'Failed to update Experience History settings:',
      error
    );

    return NextResponse.json(
      {
        error: 'Unable to update Experience History settings.'
      },
      {
        status: 500
      }
    );
  }
}