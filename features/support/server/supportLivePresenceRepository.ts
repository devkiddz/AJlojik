import 'server-only';

import type {
  SupportLiveAudience
} from '@/lib/generated/prisma/client';

import {
  prisma
} from '@/lib/prisma';

import type {
  SupportLivePresenceItem,
  SupportLivePresencePayload
} from '../supportLiveTypes';

import {
  publishSupportLiveEvent
} from './supportLiveRepository';

const PRESENCE_TTL_MS = 30_000;
const TYPING_TTL_MS = 4_000;

type SupportLivePresenceInput = {
  workspaceId: string;
  caseId: string;
  conversationId: string;
  userId: string;
  audience: SupportLiveAudience;
};

function presenceExpiry(): Date {
  return new Date(
    Date.now() +
      PRESENCE_TTL_MS
  );
}

function typingExpiry(): Date {
  return new Date(
    Date.now() +
      TYPING_TTL_MS
  );
}

async function publishSoft(
  input: Parameters<
    typeof publishSupportLiveEvent
  >[0]
): Promise<void> {
  try {
    await publishSupportLiveEvent(
      input
    );
  } catch (cause) {
    console.error(
      'Support live presence event publication failed.',
      cause
    );
  }
}

export async function touchSupportLivePresence(
  input: SupportLivePresenceInput
): Promise<void> {
  const now = new Date();

  const existing =
    await prisma.supportLivePresence.findUnique({
      where: {
        caseId_userId_audience: {
          caseId: input.caseId,
          userId: input.userId,
          audience: input.audience
        }
      },
      select: {
        active: true,
        expiresAt: true
      }
    });

  const becameActive =
    !existing ||
    !existing.active ||
    existing.expiresAt <= now;

  await prisma.supportLivePresence.upsert({
    where: {
      caseId_userId_audience: {
        caseId: input.caseId,
        userId: input.userId,
        audience: input.audience
      }
    },
    create: {
      workspaceId: input.workspaceId,
      caseId: input.caseId,
      conversationId:
        input.conversationId,
      userId: input.userId,
      audience: input.audience,
      active: true,
      lastSeenAt: now,
      expiresAt:
        presenceExpiry()
    },
    update: {
      workspaceId: input.workspaceId,
      conversationId:
        input.conversationId,
      active: true,
      lastSeenAt: now,
      expiresAt:
        presenceExpiry()
    }
  });

  if (becameActive) {
    await publishSoft({
      workspaceId: input.workspaceId,
      caseId: input.caseId,
      conversationId:
        input.conversationId,
      type:
        'PRESENCE_UPDATED',
      actorId: input.userId,
      payload: {
        audience:
          input.audience,
        active: true
      }
    });
  }
}

export async function setSupportLiveTyping(
  input:
    SupportLivePresenceInput & {
      typing: boolean;
    }
): Promise<void> {
  const now = new Date();

  await prisma.supportLivePresence.upsert({
    where: {
      caseId_userId_audience: {
        caseId: input.caseId,
        userId: input.userId,
        audience: input.audience
      }
    },
    create: {
      workspaceId: input.workspaceId,
      caseId: input.caseId,
      conversationId:
        input.conversationId,
      userId: input.userId,
      audience: input.audience,
      active: true,
      typingUntil:
        input.typing
          ? typingExpiry()
          : null,
      lastSeenAt: now,
      expiresAt:
        presenceExpiry()
    },
    update: {
      active: true,
      typingUntil:
        input.typing
          ? typingExpiry()
          : null,
      lastSeenAt: now,
      expiresAt:
        presenceExpiry()
    }
  });

  await publishSoft({
    workspaceId: input.workspaceId,
    caseId: input.caseId,
    conversationId:
      input.conversationId,
    type:
      'TYPING_UPDATED',
    actorId: input.userId,
    payload: {
      audience:
        input.audience,
      typing:
        input.typing
    }
  });
}

export async function leaveSupportLivePresence(
  input: SupportLivePresenceInput
): Promise<void> {
  const updated =
    await prisma.supportLivePresence.updateMany({
      where: {
        caseId: input.caseId,
        userId: input.userId,
        audience: input.audience,
        active: true
      },
      data: {
        active: false,
        typingUntil: null,
        expiresAt:
          new Date()
      }
    });

  if (!updated.count) {
    return;
  }

  await publishSoft({
    workspaceId: input.workspaceId,
    caseId: input.caseId,
    conversationId:
      input.conversationId,
    type:
      'PRESENCE_UPDATED',
    actorId: input.userId,
    payload: {
      audience:
        input.audience,
      active: false
    }
  });
}

export async function readSupportLivePresence(
  workspaceId: string,
  caseId: string
): Promise<SupportLivePresencePayload> {
  const now = new Date();

  const records =
    await prisma.supportLivePresence.findMany({
      where: {
        workspaceId,
        caseId,
        active: true,
        expiresAt: {
          gt: now
        }
      },
      orderBy: [
        {
          audience: 'asc'
        },
        {
          lastSeenAt: 'desc'
        }
      ],
      select: {
        id: true,
        audience: true,
        active: true,
        typingUntil: true,
        lastSeenAt: true,
        expiresAt: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

  const participants:
    SupportLivePresenceItem[] =
    records.map(record => ({
      id: record.id,
      user: record.user,
      audience:
        record.audience,
      active:
        record.active,
      typing:
        Boolean(
          record.typingUntil &&
          record.typingUntil >
            now
        ),
      lastSeenAt:
        record.lastSeenAt.toISOString(),
      expiresAt:
        record.expiresAt.toISOString()
    }));

  return {
    caseId,
    generatedAt:
      now.toISOString(),
    participants
  };
}

export async function hasActiveSupportPresence(
  caseId: string,
  userId: string
): Promise<boolean> {
  const count =
    await prisma.supportLivePresence.count({
      where: {
        caseId,
        userId,
        active: true,
        expiresAt: {
          gt: new Date()
        }
      }
    });

  return count > 0;
}
