import 'server-only';

import { createHash, randomUUID } from 'node:crypto';
import type { Prisma } from '@/lib/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { redactIntelligenceValue } from '../providers/redaction';

function json(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export function hashIntelligencePayload(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(redactIntelligenceValue(value))).digest('hex');
}

export const IntelligenceObservabilityRepository = {
  async startProviderRun(input: {
    workspaceId: string;
    resolutionId?: string | null;
    providerKey: string;
    providerKind: 'DETERMINISTIC' | 'EXTERNAL';
    operation: string;
    model?: string | null;
    promptVersion: string;
    request: unknown;
    fallbackFrom?: string | null;
  }) {
    return prisma.intelligenceProviderRun.create({
      data: {
        id: randomUUID(),
        workspaceId: input.workspaceId,
        resolutionId: input.resolutionId ?? null,
        providerKey: input.providerKey,
        providerKind: input.providerKind,
        operation: input.operation,
        model: input.model ?? null,
        promptVersion: input.promptVersion,
        status: 'STARTED',
        fallbackFrom: input.fallbackFrom ?? null,
        requestHash: hashIntelligencePayload(input.request)
      }
    });
  },

  async completeProviderRun(runId: string, input: {
    status: 'SUCCEEDED' | 'FAILED' | 'FALLBACK';
    latencyMs: number;
    response?: unknown;
    inputTokens?: number;
    outputTokens?: number;
    costMicros?: number;
    errorCode?: string | null;
    metadata?: Record<string, unknown>;
  }) {
    return prisma.intelligenceProviderRun.update({
      where: { id: runId },
      data: {
        status: input.status,
        latencyMs: Math.max(0, Math.round(input.latencyMs)),
        responseHash: input.response === undefined ? null : hashIntelligencePayload(input.response),
        inputTokens: input.inputTokens,
        outputTokens: input.outputTokens,
        costMicros: input.costMicros,
        errorCode: input.errorCode ?? null,
        metadata: input.metadata ? json(redactIntelligenceValue(input.metadata)) : undefined,
        completedAt: new Date()
      }
    });
  },

  async audit(input: {
    workspaceId: string;
    resolutionId?: string | null;
    preparedActionId?: string | null;
    actorUserId?: string | null;
    type: string;
    severity?: 'INFO' | 'WARNING' | 'ERROR';
    traceId?: string;
    message: string;
    metadata?: Record<string, unknown>;
  }) {
    return prisma.intelligenceAuditEvent.create({
      data: {
        id: randomUUID(),
        workspaceId: input.workspaceId,
        resolutionId: input.resolutionId ?? null,
        preparedActionId: input.preparedActionId ?? null,
        actorUserId: input.actorUserId ?? null,
        type: input.type,
        severity: input.severity ?? 'INFO',
        traceId: input.traceId ?? randomUUID(),
        message: input.message.slice(0, 1000),
        metadata: input.metadata ? json(redactIntelligenceValue(input.metadata)) : undefined
      }
    });
  },

  async summary(workspaceId: string, hours = 24) {
    const safeHours = Math.max(1, Math.min(hours, 168));
    const since = new Date(Date.now() - safeHours * 60 * 60 * 1000);
    const [runs, warnings, resolutions, actions] = await Promise.all([
      prisma.intelligenceProviderRun.findMany({ where: { workspaceId, createdAt: { gte: since } }, take: 500 }),
      prisma.intelligenceAuditEvent.count({ where: { workspaceId, createdAt: { gte: since }, severity: { in: ['WARNING', 'ERROR'] } } }),
      prisma.intelligenceResolution.findMany({ where: { workspaceId, createdAt: { gte: since } }, select: { status: true } }),
      prisma.intelligencePreparedAction.findMany({ where: { resolution: { workspaceId }, createdAt: { gte: since } }, select: { status: true } })
    ]);
    const timed = runs.filter(run => run.latencyMs !== null);
    return {
      windowHours: safeHours,
      providerRuns: runs.length,
      successfulRuns: runs.filter(run => run.status === 'SUCCEEDED').length,
      failedRuns: runs.filter(run => run.status === 'FAILED').length,
      fallbackRuns: runs.filter(run => run.status === 'FALLBACK').length,
      averageLatencyMs: timed.length ? Math.round(timed.reduce((sum, run) => sum + (run.latencyMs ?? 0), 0) / timed.length) : 0,
      warningAndErrorEvents: warnings,
      resolutionsCreated: resolutions.length,
      resolutionsCompleted: resolutions.filter(item => item.status === 'APPLIED').length,
      actionsApplied: actions.filter(item => item.status === 'APPLIED').length,
      actionsFailed: actions.filter(item => item.status === 'FAILED').length,
      providers: Array.from(new Set(runs.map(run => run.providerKey)))
    };
  }
};
