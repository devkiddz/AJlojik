import {
  NextResponse
} from 'next/server';

import {
  headers
} from 'next/headers';

import {
  auth
} from '@/lib/auth';

import {
  prisma
} from '@/lib/prisma';

type ExperienceSettingsPayload = {
  experienceDensity?: string;
  recommendationMode?: string;

  preferredCategorySlugs?: unknown;

  autoplayPreviews?: boolean;
  discoveryEnabled?: boolean;
  shoppingNotifications?: boolean;
  personalizationEnabled?: boolean;
};

function normalizeStringArray(
  value: unknown
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter(
          (
            item
          ): item is string =>
            typeof item ===
              'string' &&
            item.trim().length >
              0
        )
        .map(item =>
          item.trim()
        )
    )
  );
}

function normalizeOptionalString(
  value: unknown,
  fallback: string
): string {
  return typeof value ===
      'string' &&
    value.trim().length > 0
    ? value.trim()
    : fallback;
}

async function requireUser() {
  const session =
    await auth.api.getSession({
      headers:
        await headers()
    });

  if (!session?.user?.id) {
    return null;
  }

  return session;
}

export async function GET() {
  try {
    const session =
      await requireUser();

    if (!session) {
      return NextResponse.json(
        {
          error:
            'Authentication is required.'
        },
        {
          status: 401
        }
      );
    }

    const profile =
      await prisma.experienceProfile.upsert({
        where: {
          userId:
            session.user.id
        },

        update: {},

        create: {
          userId:
            session.user.id
        },

        select: {
          experienceDensity:
            true,

          autoplayPreviews:
            true,

          discoveryEnabled:
            true,

          recommendationMode:
            true,

          shoppingNotifications:
            true,

          personalizationEnabled:
            true,

          preferredCategorySlugs:
            true
        }
      });

    return NextResponse.json({
      user: {
        name:
          session.user.name,

        email:
          session.user.email,

        image:
          session.user.image ??
          ''
      },

      profile
    });
  } catch (error) {
    console.error(
      '[experience-settings:get]',
      error
    );

    return NextResponse.json(
      {
        error:
          'Unable to load experience settings.'
      },
      {
        status: 500
      }
    );
  }
}

export async function PATCH(
  request: Request
) {
  try {
    const session =
      await requireUser();

    if (!session) {
      return NextResponse.json(
        {
          error:
            'Authentication is required.'
        },
        {
          status: 401
        }
      );
    }

    const body =
      (await request.json()) as
        ExperienceSettingsPayload;

    const experienceDensity =
      normalizeOptionalString(
        body.experienceDensity,
        'immersive'
      );

    const recommendationMode =
      normalizeOptionalString(
        body.recommendationMode,
        'balanced'
      );

    const preferredCategorySlugs =
      normalizeStringArray(
        body.preferredCategorySlugs
      );

    const profile =
      await prisma.experienceProfile.upsert({
        where: {
          userId:
            session.user.id
        },

        create: {
          userId:
            session.user.id,

          experienceDensity,

          recommendationMode,

          preferredCategorySlugs,

          autoplayPreviews:
            body.autoplayPreviews !==
            false,

          discoveryEnabled:
            body.discoveryEnabled !==
            false,

          shoppingNotifications:
            body.shoppingNotifications !==
            false,

          personalizationEnabled:
            body.personalizationEnabled !==
            false
        },

        update: {
          experienceDensity,

          recommendationMode,

          preferredCategorySlugs,

          autoplayPreviews:
            body.autoplayPreviews !==
            false,

          discoveryEnabled:
            body.discoveryEnabled !==
            false,

          shoppingNotifications:
            body.shoppingNotifications !==
            false,

          personalizationEnabled:
            body.personalizationEnabled !==
            false
        },

        select: {
          experienceDensity:
            true,

          autoplayPreviews:
            true,

          discoveryEnabled:
            true,

          recommendationMode:
            true,

          shoppingNotifications:
            true,

          personalizationEnabled:
            true,

          preferredCategorySlugs:
            true
        }
      });

    return NextResponse.json({
      profile
    });
  } catch (error) {
    if (
      error instanceof SyntaxError
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid request payload.'
        },
        {
          status: 400
        }
      );
    }

    console.error(
      '[experience-settings:patch]',
      error
    );

    return NextResponse.json(
      {
        error:
          'Unable to update experience settings.'
      },
      {
        status: 500
      }
    );
  }
}