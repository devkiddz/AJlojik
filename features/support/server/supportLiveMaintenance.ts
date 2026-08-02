import 'server-only';

import {
  prisma
} from '@/lib/prisma';

const EVENT_RETENTION_DAYS = 7;
const PRESENCE_RETENTION_HOURS = 24;
const AUTOMATIC_CLEANUP_INTERVAL_MS =
  30 * 60 * 1000;

let lastAutomaticCleanupAt = 0;

type PruneSupportLiveRuntimeInput = {
  workspaceId?: string;
};

export type SupportLiveRuntimePruneResult = {
  workspaceId: string | null;
  deletedEvents: number;
  deletedPresenceRecords: number;
  eventCutoff: string;
  presenceCutoff: string;
  completedAt: string;
};

export type SupportLiveRuntimeDiagnostics = {
  workspaceId: string;
  generatedAt: string;
  retention: {
    eventDays: number;
    stalePresenceHours: number;
  };
  events: {
    total: number;
    last24Hours: number;
    oldestCreatedAt: string | null;
    newestCreatedAt: string | null;
    newestCursor: number;
  };
  presence: {
    active: number;
    stale: number;
    total: number;
  };
};

function eventCutoff(): Date {
  return new Date(
    Date.now() -
      EVENT_RETENTION_DAYS *
        24 *
        60 *
        60 *
        1000
  );
}

function presenceCutoff(): Date {
  return new Date(
    Date.now() -
      PRESENCE_RETENTION_HOURS *
        60 *
        60 *
        1000
  );
}

export async function pruneSupportLiveRuntime(
  input:
    PruneSupportLiveRuntimeInput = {}
): Promise<SupportLiveRuntimePruneResult> {
  const eventBefore =
    eventCutoff();

  const presenceBefore =
    presenceCutoff();

  const eventWhere = {
    ...(input.workspaceId
      ? {
          workspaceId:
            input.workspaceId
        }
      : {}),
    createdAt: {
      lt: eventBefore
    }
  };

  const presenceWhere = {
    ...(input.workspaceId
      ? {
          workspaceId:
            input.workspaceId
        }
      : {}),
    expiresAt: {
      lt: presenceBefore
    }
  };

  const [
    events,
    presence
  ] =
    await prisma.$transaction([
      prisma.supportLiveEvent.deleteMany({
        where: eventWhere
      }),
      prisma.supportLivePresence.deleteMany({
        where: presenceWhere
      })
    ]);

  return {
    workspaceId:
      input.workspaceId ?? null,
    deletedEvents:
      events.count,
    deletedPresenceRecords:
      presence.count,
    eventCutoff:
      eventBefore.toISOString(),
    presenceCutoff:
      presenceBefore.toISOString(),
    completedAt:
      new Date().toISOString()
  };
}

export function scheduleSupportLiveRuntimeCleanup(
  workspaceId: string
): void {
  const now = Date.now();

  if (
    now -
      lastAutomaticCleanupAt <
    AUTOMATIC_CLEANUP_INTERVAL_MS
  ) {
    return;
  }

  lastAutomaticCleanupAt =
    now;

  void pruneSupportLiveRuntime({
    workspaceId
  }).catch(cause => {
    console.error(
      'Support live runtime cleanup failed.',
      cause
    );
  });
}

export async function getSupportLiveRuntimeDiagnostics(
  workspaceId: string
): Promise<SupportLiveRuntimeDiagnostics> {
  const now = new Date();

  const last24Hours =
    new Date(
      now.getTime() -
        24 *
          60 *
          60 *
          1000
    );

  const [
    totalEvents,
    recentEvents,
    eventBounds,
    activePresence,
    stalePresence,
    totalPresence
  ] =
    await prisma.$transaction([
      prisma.supportLiveEvent.count({
        where: {
          workspaceId
        }
      }),
      prisma.supportLiveEvent.count({
        where: {
          workspaceId,
          createdAt: {
            gte: last24Hours
          }
        }
      }),
      prisma.supportLiveEvent.aggregate({
        where: {
          workspaceId
        },
        _min: {
          createdAt: true
        },
        _max: {
          id: true,
          createdAt: true
        }
      }),
      prisma.supportLivePresence.count({
        where: {
          workspaceId,
          active: true,
          expiresAt: {
            gt: now
          }
        }
      }),
      prisma.supportLivePresence.count({
        where: {
          workspaceId,
          expiresAt: {
            lte: now
          }
        }
      }),
      prisma.supportLivePresence.count({
        where: {
          workspaceId
        }
      })
    ]);

  return {
    workspaceId,
    generatedAt:
      now.toISOString(),
    retention: {
      eventDays:
        EVENT_RETENTION_DAYS,
      stalePresenceHours:
        PRESENCE_RETENTION_HOURS
    },
    events: {
      total:
        totalEvents,
      last24Hours:
        recentEvents,
      oldestCreatedAt:
        eventBounds._min.createdAt
          ?.toISOString() ??
        null,
      newestCreatedAt:
        eventBounds._max.createdAt
          ?.toISOString() ??
        null,
      newestCursor:
        eventBounds._max.id ?? 0
    },
    presence: {
      active:
        activePresence,
      stale:
        stalePresence,
      total:
        totalPresence
    }
  };
}
