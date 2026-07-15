import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';

import { clearExperienceHistory } from '@/features/experience-stack/services/clear-experience-history';
import { getExperienceHistory } from '@/features/experience-stack/services/get-experience-history';
import { pushExperienceHistory } from '@/features/experience-stack/services/push-experience-history';

import type {
  ExperienceHistorySource,
  Prisma
} from '@/lib/generated/prisma/client';

// ============================================================
// REQUEST TYPES
// ============================================================

type PushHistoryBody = {
  workspaceId?: string;

  label?: string;
  subtitle?: string | null;

  categorySlug?: string;
  source?: ExperienceHistorySource;

  experienceId?: string | null;
  campaignId?: string | null;
  collectionId?: string | null;
  productId?: string | null;

  intentSnapshot?: Prisma.InputJsonValue;
  contextSnapshot?: Prisma.InputJsonValue | null;

  fingerprint?: string;
};

type ClearHistoryBody = {
  workspaceId?: string;
};

// ============================================================
// AUTHENTICATION
// ============================================================

async function getAuthenticatedUserId(): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  return session?.user?.id ?? null;
}

// ============================================================
// GET
// Load the authenticated user's stack for one workspace.
// ============================================================

export async function GET(request: Request) {
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

    const url = new URL(request.url);
    const workspaceId = url.searchParams.get('workspaceId');

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

    const state = await getExperienceHistory({
      userId,
      workspaceId
    });

    return NextResponse.json(state);
  } catch (error) {
    console.error(
      'Failed to load Experience History:',
      error
    );

    return NextResponse.json(
      {
        error: 'Unable to load Experience History.'
      },
      {
        status: 500
      }
    );
  }
}

// ============================================================
// POST
// Persist one meaningful assembled experience.
// ============================================================

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

    const body = (await request.json()) as PushHistoryBody;

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

    if (!body.label?.trim()) {
      return NextResponse.json(
        {
          error: 'label is required.'
        },
        {
          status: 400
        }
      );
    }

    if (!body.categorySlug?.trim()) {
      return NextResponse.json(
        {
          error: 'categorySlug is required.'
        },
        {
          status: 400
        }
      );
    }

    if (!body.source) {
      return NextResponse.json(
        {
          error: 'source is required.'
        },
        {
          status: 400
        }
      );
    }

    if (!body.intentSnapshot) {
      return NextResponse.json(
        {
          error: 'intentSnapshot is required.'
        },
        {
          status: 400
        }
      );
    }

    if (!body.fingerprint?.trim()) {
      return NextResponse.json(
        {
          error: 'fingerprint is required.'
        },
        {
          status: 400
        }
      );
    }

    const entry = await pushExperienceHistory({
      userId,
      workspaceId: body.workspaceId,

      label: body.label.trim(),
      subtitle: body.subtitle?.trim() || null,

      categorySlug: body.categorySlug.trim(),
      source: body.source,

      experienceId: body.experienceId ?? null,
      campaignId: body.campaignId ?? null,
      collectionId: body.collectionId ?? null,
      productId: body.productId ?? null,

      intentSnapshot: body.intentSnapshot,
      contextSnapshot: body.contextSnapshot ?? null,

      fingerprint: body.fingerprint.trim()
    });

    return NextResponse.json(entry, {
      status: entry ? 201 : 200
    });
  } catch (error) {
    console.error(
      'Failed to push Experience History:',
      error
    );

    return NextResponse.json(
      {
        error: 'Unable to save Experience History.'
      },
      {
        status: 500
      }
    );
  }
}

// ============================================================
// DELETE
// Clear history for one user inside one workspace.
// The Provider decides whether the Feed should also reset.
// ============================================================

export async function DELETE(request: Request) {
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

    const body = (await request.json()) as ClearHistoryBody;

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

    const deletedCount = await clearExperienceHistory({
      userId,
      workspaceId: body.workspaceId
    });

    return NextResponse.json({
      deletedCount
    });
  } catch (error) {
    console.error(
      'Failed to clear Experience History:',
      error
    );

    return NextResponse.json(
      {
        error: 'Unable to clear Experience History.'
      },
      {
        status: 500
      }
    );
  }
}