import 'server-only';

import {
  Prisma
} from '@/lib/generated/prisma/client';

import type {
  SupportKnowledgeEntry,
  SupportKnowledgeInteraction
} from '@/lib/generated/prisma/client';
import { prisma } from '@/lib/prisma';

import type {
  SupportKnowledgeEntryPerformance,
  SupportKnowledgeLearningInteraction,
  SupportKnowledgeMutation,
  SupportKnowledgeStudioEntry,
  SupportKnowledgeStudioSnapshot
} from '../supportKnowledgeManagementTypes';
import type { SupportGuideIntent } from '../supportGuideTypes';
import { buildSupportKnowledgeLearningCandidates } from './supportKnowledgeLearning';
import { normalizeSupportKnowledgeText } from './supportKnowledgeText';

const LEARNING_WINDOW_DAYS = 90;
const LEARNING_INTERACTION_LIMIT = 1500;
const RECENT_INTERACTION_LIMIT = 100;

type EntryWithRelations = Prisma.SupportKnowledgeEntryGetPayload<{
  include: {
    supportKnowledgeBucket: true;
    questionExamples: {
      orderBy: [{ weight: 'desc' }, { createdAt: 'asc' }];
    };
  };
}>;

function performanceMap(
  interactions: readonly {
    entryId: string | null;
    outcome: SupportKnowledgeInteraction['outcome'];
    feedbackHelpful: boolean | null;
    humanRequested: boolean;
  }[]
): Map<string, SupportKnowledgeEntryPerformance> {
  const map = new Map<string, SupportKnowledgeEntryPerformance>();

  for (const interaction of interactions) {
    if (!interaction.entryId) continue;
    const current = map.get(interaction.entryId) ?? {
      interactions: 0,
      answered: 0,
      contextRequired: 0,
      humanRequests: 0,
      helpful: 0,
      unhelpful: 0
    };

    current.interactions += 1;
    if (interaction.outcome === 'ANSWERED') current.answered += 1;
    if (interaction.outcome === 'CONTEXT_REQUIRED') current.contextRequired += 1;
    if (
      interaction.humanRequested ||
      interaction.outcome === 'HUMAN_SUPPORT_REQUIRED'
    ) {
      current.humanRequests += 1;
    }
    if (interaction.feedbackHelpful === true) current.helpful += 1;
    if (interaction.feedbackHelpful === false) current.unhelpful += 1;
    map.set(interaction.entryId, current);
  }

  return map;
}

function entrySnapshot(
  entry: EntryWithRelations,
  performance: SupportKnowledgeEntryPerformance
): SupportKnowledgeStudioEntry {
  return {
    id: entry.id,
    workspaceId: entry.workspaceId,
    bucketId: entry.supportKnowledgeBucketId,
    bucketName: entry.supportKnowledgeBucket?.name ?? null,
    slug: entry.slug,
    title: entry.title,
    category: entry.category,
    intent: entry.intent as SupportGuideIntent,
    primaryQuestion: entry.primaryQuestion,
    answerTemplate: entry.answerTemplate,
    clarificationAnswer: entry.clarificationAnswer,
    escalationAnswer: entry.escalationAnswer,
    keywords: [...entry.keywords],
    synonyms: [...entry.synonyms],
    requiredContext: [...entry.requiredContext],
    conditions: entry.conditions,
    actions: entry.actions,
    status: entry.status,
    priority: entry.priority,
    confidenceThreshold: entry.confidenceThreshold,
    version: entry.version,
    publishedAt: entry.publishedAt?.toISOString() ?? null,
    archivedAt: entry.archivedAt?.toISOString() ?? null,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
    questionExamples: entry.questionExamples.map(example => ({
      id: example.id,
      text: example.text,
      normalizedText: example.normalizedText,
      locale: example.locale,
      weight: example.weight,
      active: example.active
    })),
    performance
  };
}

function learningInteraction(
  interaction: Prisma.SupportKnowledgeInteractionGetPayload<{
    include: {
      entry: {
        select: { title: true };
      };
    };
  }>
): SupportKnowledgeLearningInteraction {
  return {
    id: interaction.id,
    question: interaction.question,
    normalizedQuestion: interaction.normalizedQuestion,
    matchedIntent: interaction.matchedIntent,
    confidence: interaction.confidence,
    outcome: interaction.outcome,
    feedbackHelpful: interaction.feedbackHelpful,
    feedbackReason: interaction.feedbackReason,
    humanRequested: interaction.humanRequested,
    pathname: interaction.pathname,
    entryId: interaction.entryId,
    entryTitle: interaction.entry?.title ?? null,
    createdAt: interaction.createdAt.toISOString()
  };
}

export async function getSupportKnowledgeStudioSnapshot(
  workspaceId: string
): Promise<SupportKnowledgeStudioSnapshot> {
  const learningSince = new Date(
    Date.now() - LEARNING_WINDOW_DAYS * 24 * 60 * 60 * 1000
  );

  const [
    entries,
    buckets,
    learningRows,
    outcomeCounts,
    totalInteractions,
    helpfulFeedback,
    unhelpfulFeedback
  ] = await Promise.all([
    prisma.supportKnowledgeEntry.findMany({
      where: { workspaceId },
      orderBy: [{ status: 'asc' }, { priority: 'desc' }, { updatedAt: 'desc' }],
      include: {
        supportKnowledgeBucket: true,
        questionExamples: {
          orderBy: [{ weight: 'desc' }, { createdAt: 'asc' }]
        }
      }
    }),
    prisma.supportKnowledgeBucket.findMany({
      where: { workspaceId },
      orderBy: [{ active: 'desc' }, { priority: 'desc' }, { name: 'asc' }],
      include: { _count: { select: { entries: true } } }
    }),
    prisma.supportKnowledgeInteraction.findMany({
      where: { workspaceId, createdAt: { gte: learningSince } },
      orderBy: { createdAt: 'desc' },
      take: LEARNING_INTERACTION_LIMIT,
      include: { entry: { select: { title: true } } }
    }),
    prisma.supportKnowledgeInteraction.groupBy({
      by: ['outcome'],
      where: { workspaceId },
      _count: { _all: true }
    }),
    prisma.supportKnowledgeInteraction.count({ where: { workspaceId } }),
    prisma.supportKnowledgeInteraction.count({
      where: { workspaceId, feedbackHelpful: true }
    }),
    prisma.supportKnowledgeInteraction.count({
      where: { workspaceId, feedbackHelpful: false }
    })
  ]);

  const interactionItems = learningRows.map(learningInteraction);
  const performances = performanceMap(learningRows);
  const zeroPerformance: SupportKnowledgeEntryPerformance = {
    interactions: 0,
    answered: 0,
    contextRequired: 0,
    humanRequests: 0,
    helpful: 0,
    unhelpful: 0
  };
  const candidates = buildSupportKnowledgeLearningCandidates(
    interactionItems,
    50
  );
  const outcomes = Object.fromEntries(
    outcomeCounts.map(item => [item.outcome, item._count._all])
  ) as Partial<Record<SupportKnowledgeInteraction['outcome'], number>>;
  const feedbackTotal = helpfulFeedback + unhelpfulFeedback;

  return {
    workspaceId,
    generatedAt: new Date().toISOString(),
    metrics: {
      totalEntries: entries.length,
      activeEntries: entries.filter(entry => entry.status === 'ACTIVE').length,
      draftEntries: entries.filter(entry => entry.status === 'DRAFT').length,
      archivedEntries: entries.filter(entry => entry.status === 'ARCHIVED').length,
      totalInteractions,
      answeredInteractions: outcomes.ANSWERED ?? 0,
      noMatchInteractions: outcomes.NO_MATCH ?? 0,
      contextRequiredInteractions: outcomes.CONTEXT_REQUIRED ?? 0,
      humanRequestedInteractions: learningRows.filter(
        item => item.humanRequested || item.outcome === 'HUMAN_SUPPORT_REQUIRED'
      ).length,
      helpfulFeedback,
      unhelpfulFeedback,
      helpfulRate: feedbackTotal
        ? Number((helpfulFeedback / feedbackTotal).toFixed(3))
        : null,
      learningCandidates: candidates.length
    },
    buckets: buckets.map(bucket => ({
      id: bucket.id,
      slug: bucket.slug,
      name: bucket.name,
      description: bucket.description,
      priority: bucket.priority,
      active: bucket.active,
      entriesCount: bucket._count.entries
    })),
    entries: entries.map(entry =>
      entrySnapshot(entry, performances.get(entry.id) ?? zeroPerformance)
    ),
    learningCandidates: candidates,
    recentInteractions: interactionItems.slice(0, RECENT_INTERACTION_LIMIT)
  };
}

async function resolveBucketId(
  transaction: Prisma.TransactionClient,
  workspaceId: string,
  requestedBucketId: string | null
): Promise<string> {
  if (requestedBucketId) {
    const bucket = await transaction.supportKnowledgeBucket.findFirst({
      where: { id: requestedBucketId, workspaceId },
      select: { id: true }
    });
    if (!bucket) {
      throw new Error('The selected Support Knowledge bucket could not be found.');
    }
    return bucket.id;
  }

  const bucket = await transaction.supportKnowledgeBucket.upsert({
    where: { workspaceId_slug: { workspaceId, slug: 'auto-support' } },
    create: {
      workspaceId,
      slug: 'auto-support',
      name: 'AJ Support Intelligence',
      description:
        'Approved customer-facing knowledge used by AJ Support Intelligence.',
      priority: 100,
      active: true
    },
    update: { active: true },
    select: { id: true }
  });

  return bucket.id;
}

function auditAction(
  previous: SupportKnowledgeEntry['status'] | null,
  next: SupportKnowledgeMutation['status']
): string {
  if (previous === null) return 'SUPPORT_KNOWLEDGE_CREATED';
  if (previous !== 'ACTIVE' && next === 'ACTIVE') {
    return 'SUPPORT_KNOWLEDGE_PUBLISHED';
  }
  if (next === 'ARCHIVED') return 'SUPPORT_KNOWLEDGE_ARCHIVED';
  return 'SUPPORT_KNOWLEDGE_UPDATED';
}

export async function saveSupportKnowledgeEntry(input: {
  workspaceId: string;
  actorId: string;
  entryId?: string | null;
  mutation: SupportKnowledgeMutation;
}): Promise<SupportKnowledgeStudioEntry> {
  return prisma.$transaction(async transaction => {
    const existing = input.entryId
      ? await transaction.supportKnowledgeEntry.findFirst({
          where: { id: input.entryId, workspaceId: input.workspaceId }
        })
      : null;

    if (input.entryId && !existing) {
      throw new Error('The Support Knowledge entry could not be found.');
    }

    const bucketId = await resolveBucketId(
      transaction,
      input.workspaceId,
      input.mutation.bucketId
    );
    const now = new Date();
    const sharedData = {
      supportKnowledgeBucketId: bucketId,
      slug: input.mutation.slug,
      title: input.mutation.title,
      category: input.mutation.category,
      intent: input.mutation.intent,
      primaryQuestion: input.mutation.primaryQuestion,
      answerTemplate: input.mutation.answerTemplate,
      clarificationAnswer: input.mutation.clarificationAnswer,
      escalationAnswer: input.mutation.escalationAnswer,
      keywords: input.mutation.keywords,
      synonyms: input.mutation.synonyms,
      requiredContext: input.mutation.requiredContext,
      conditions:
        input.mutation.conditions === null
          ? Prisma.JsonNull
          : (input.mutation.conditions as Prisma.InputJsonValue),
      actions: input.mutation.actions as Prisma.InputJsonValue,
      status: input.mutation.status,
      priority: input.mutation.priority,
      confidenceThreshold: input.mutation.confidenceThreshold,
      publishedAt:
        input.mutation.status === 'ACTIVE'
          ? existing?.publishedAt ?? now
          : existing?.publishedAt ?? null,
      archivedAt: input.mutation.status === 'ARCHIVED' ? now : null
    };

    const entry = existing
      ? await transaction.supportKnowledgeEntry.update({
          where: { id: existing.id },
          data: { ...sharedData, version: { increment: 1 } }
        })
      : await transaction.supportKnowledgeEntry.create({
          data: { workspaceId: input.workspaceId, ...sharedData, version: 1 }
        });

    await transaction.supportKnowledgeQuestionExample.deleteMany({
      where: { entryId: entry.id }
    });

    if (input.mutation.examples.length) {
      await transaction.supportKnowledgeQuestionExample.createMany({
        data: input.mutation.examples.map(example => ({
          entryId: entry.id,
          text: example.text,
          normalizedText: normalizeSupportKnowledgeText(example.text),
          locale: example.locale,
          weight: example.weight,
          active: example.active
        }))
      });
    }

    await transaction.adminAuditEvent.create({
      data: {
        workspaceId: input.workspaceId,
        actorId: input.actorId,
        action: auditAction(existing?.status ?? null, input.mutation.status),
        targetType: 'OTHER',
        targetId: entry.id,
        summary: `${
          input.mutation.status === 'ACTIVE'
            ? 'Published'
            : input.mutation.status === 'ARCHIVED'
              ? 'Archived'
              : existing
                ? 'Updated'
                : 'Created'
        } Support Knowledge: ${entry.title}`,
        metadata: {
          supportKnowledgeEntryId: entry.id,
          slug: entry.slug,
          previousStatus: existing?.status ?? null,
          status: input.mutation.status,
          version: existing ? existing.version + 1 : 1
        }
      }
    });

    const saved = await transaction.supportKnowledgeEntry.findUniqueOrThrow({
      where: { id: entry.id },
      include: {
        supportKnowledgeBucket: true,
        questionExamples: {
          orderBy: [{ weight: 'desc' }, { createdAt: 'asc' }]
        }
      }
    });

    return entrySnapshot(saved, {
      interactions: 0,
      answered: 0,
      contextRequired: 0,
      humanRequests: 0,
      helpful: 0,
      unhelpful: 0
    });
  });
}
