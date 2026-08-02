import 'server-only';

import type {
  Prisma
} from '@/lib/generated/prisma/client';

import {
  prisma
} from '@/lib/prisma';

import {
  scheduleSupportLiveRuntimeCleanup
} from './supportLiveMaintenance';

import type {
  SupportLiveEventItem,
  SupportLiveEventTypeValue
} from '../supportLiveTypes';

type PublishSupportLiveEventInput = {
  workspaceId: string;
  caseId: string;
  conversationId: string;
  type: SupportLiveEventTypeValue;
  actorId?: string | null;
  payload?: Prisma.InputJsonValue;
};

type ReadSupportLiveEventsInput = {
  workspaceId: string;
  caseId: string;
  afterId: number;
  limit?: number;
};

function mapSupportLiveEvent(
  event: {
    id: number;
    workspaceId: string;
    caseId: string;
    conversationId: string;
    type: SupportLiveEventTypeValue;
    actorId: string | null;
    payload: Prisma.JsonValue | null;
    createdAt: Date;
  }
): SupportLiveEventItem {
  return {
    id: event.id,
    workspaceId: event.workspaceId,
    caseId: event.caseId,
    conversationId:
      event.conversationId,
    type: event.type,
    actorId: event.actorId,
    payload: event.payload,
    createdAt:
      event.createdAt.toISOString()
  };
}

export async function publishSupportLiveEvent(
  input: PublishSupportLiveEventInput
): Promise<SupportLiveEventItem> {
  const event =
    await prisma.supportLiveEvent.create({
      data: {
        workspaceId: input.workspaceId,
        caseId: input.caseId,
        conversationId:
          input.conversationId,
        type: input.type,
        actorId:
          input.actorId ?? null,
        payload: input.payload
      }
    });

  scheduleSupportLiveRuntimeCleanup(
    input.workspaceId
  );

  return mapSupportLiveEvent(event);
}

export async function resolveSupportLiveCursor(
  workspaceId: string,
  caseId: string
): Promise<number> {
  const cursor =
    await prisma.supportLiveEvent.aggregate({
      where: {
        workspaceId,
        caseId
      },
      _max: {
        id: true
      }
    });

  return cursor._max.id ?? 0;
}

export async function readSupportLiveEvents(
  input: ReadSupportLiveEventsInput
): Promise<SupportLiveEventItem[]> {
  const limit = Math.min(
    Math.max(
      Math.round(input.limit ?? 100),
      1
    ),
    200
  );

  const events =
    await prisma.supportLiveEvent.findMany({
      where: {
        workspaceId: input.workspaceId,
        caseId: input.caseId,
        id: {
          gt: Math.max(
            Math.round(input.afterId),
            0
          )
        }
      },
      orderBy: {
        id: 'asc'
      },
      take: limit
    });

  return events.map(
    mapSupportLiveEvent
  );
}
