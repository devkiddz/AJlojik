import 'server-only';

import type { Prisma } from '@/lib/generated/prisma/client';
import { prisma } from '@/lib/prisma';

import type {
  RecordSupportKnowledgeInteractionInput,
  SupportKnowledgeEntrySnapshot
} from '../supportKnowledgeTypes';

import { normalizeSupportKnowledgeText } from './supportKnowledgeText';

export { normalizeSupportKnowledgeText } from './supportKnowledgeText';

export async function listActiveSupportKnowledge(
  workspaceId: string
): Promise<SupportKnowledgeEntrySnapshot[]> {
  const entries = await prisma.supportKnowledgeEntry.findMany({
    where: {
      workspaceId,
      status: 'ACTIVE'
    },
    orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }],
    include: {
      questionExamples: {
        where: { active: true },
        orderBy: [{ weight: 'desc' }, { createdAt: 'asc' }]
      }
    }
  });

  return entries.map(entry => ({
    id: entry.id,
    workspaceId: entry.workspaceId,
    slug: entry.slug,
    title: entry.title,
    category: entry.category,
    intent: entry.intent,
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
    questionExamples: entry.questionExamples.map(example => ({
      id: example.id,
      text: example.text,
      normalizedText: example.normalizedText,
      locale: example.locale,
      weight: example.weight,
      active: example.active
    }))
  }));
}

export async function recordSupportKnowledgeInteraction(
  input: RecordSupportKnowledgeInteractionInput
): Promise<string> {
  const created = await prisma.supportKnowledgeInteraction.create({
    data: {
      workspaceId: input.workspaceId,
      customerId: input.customerId ?? null,
      supportCaseId: input.supportCaseId ?? null,
      entryId: input.entryId ?? null,
      question: input.question.trim(),
      normalizedQuestion: normalizeSupportKnowledgeText(input.question),
      matchedIntent: input.matchedIntent ?? null,
      confidence: input.confidence ?? null,
      outcome: input.outcome,
      answer: input.answer ?? null,
      feedbackHelpful: input.feedbackHelpful ?? null,
      feedbackReason: input.feedbackReason ?? null,
      humanRequested: input.humanRequested ?? false,
      pathname: input.pathname ?? null,
      metadata: (input.metadata ?? undefined) as
        | Prisma.InputJsonValue
        | undefined
    },
    select: { id: true }
  });

  return created.id;
}
