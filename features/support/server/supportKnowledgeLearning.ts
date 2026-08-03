import type { SupportGuideIntent } from '../supportGuideTypes';
import type { SupportKnowledgeInteractionOutcomeValue } from '../supportKnowledgeTypes';
import type {
  SupportKnowledgeLearningCandidate,
  SupportKnowledgeLearningInteraction
} from '../supportKnowledgeManagementTypes';
import { slugifySupportKnowledge } from './supportKnowledgeManagementValidation';

const CATEGORY_BY_INTENT: Partial<Record<SupportGuideIntent, string>> = {
  GREETING: 'CONVERSATION',
  PAYMENT_HELP: 'PAYMENT',
  ORDER_TRACKING: 'ORDER',
  DELIVERY_HELP: 'DELIVERY',
  ACCOUNT_HELP: 'ACCOUNT',
  SHOPPING_LISTS: 'SHOPPING_LIST',
  VENDOR_CONTACT: 'VENDOR',
  MULTIVENDOR_AVAILABILITY: 'VENDOR',
  PRODUCT_AVAILABILITY: 'PRODUCT',
  RETURNS_AND_REFUNDS: 'ORDER',
  ALCOHOL_DELIVERY_ELIGIBILITY: 'DELIVERY',
  CART_AND_CHECKOUT: 'CHECKOUT',
  HOW_TO_BUY: 'SHOPPING',
  HOW_TO_USE_APP: 'PLATFORM',
  PARTY_PLANNING: 'PARTY',
  HUMAN_SUPPORT: 'HUMAN_SUPPORT',
  UNKNOWN: 'GENERAL'
};

const KNOWN_INTENTS: SupportGuideIntent[] = [
  'GREETING',
  'HOW_TO_BUY',
  'HOW_TO_USE_APP',
  'MULTIVENDOR_AVAILABILITY',
  'CART_AND_CHECKOUT',
  'PAYMENT_HELP',
  'ORDER_TRACKING',
  'DELIVERY_HELP',
  'ACCOUNT_HELP',
  'SHOPPING_LISTS',
  'VENDOR_CONTACT',
  'RETURNS_AND_REFUNDS',
  'PRODUCT_AVAILABILITY',
  'ALCOHOL_DELIVERY_ELIGIBILITY',
  'PARTY_PLANNING',
  'HUMAN_SUPPORT',
  'UNKNOWN'
];

function guideIntent(value: string | null): SupportGuideIntent {
  return KNOWN_INTENTS.includes(value as SupportGuideIntent)
    ? (value as SupportGuideIntent)
    : 'UNKNOWN';
}

function titleFromQuestion(question: string): string {
  const compact = question
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[?.!]+$/g, '');
  if (!compact) return 'New Support Knowledge';
  return compact.charAt(0).toUpperCase() + compact.slice(1, 100);
}

function reviewReason(candidate: {
  noMatchCount: number;
  clarificationCount: number;
  contextRequiredCount: number;
  humanRequestCount: number;
  unhelpfulCount: number;
}): string {
  const reasons: string[] = [];
  if (candidate.noMatchCount) reasons.push(`${candidate.noMatchCount} no-match`);
  if (candidate.unhelpfulCount) reasons.push(`${candidate.unhelpfulCount} unhelpful`);
  if (candidate.humanRequestCount) reasons.push(`${candidate.humanRequestCount} human handoff`);
  if (candidate.contextRequiredCount) reasons.push(`${candidate.contextRequiredCount} context-required`);
  if (candidate.clarificationCount) reasons.push(`${candidate.clarificationCount} clarification`);
  return reasons.length ? reasons.join(' · ') : 'Repeated customer question';
}

export function buildSupportKnowledgeLearningCandidates(
  interactions: readonly SupportKnowledgeLearningInteraction[],
  limit = 50
): SupportKnowledgeLearningCandidate[] {
  const groups = new Map<string, SupportKnowledgeLearningInteraction[]>();

  for (const interaction of interactions) {
    const isCandidate =
      interaction.outcome !== 'ANSWERED' ||
      interaction.feedbackHelpful === false ||
      interaction.humanRequested;
    if (!isCandidate || interaction.normalizedQuestion.length < 2) continue;
    groups.set(interaction.normalizedQuestion, [
      ...(groups.get(interaction.normalizedQuestion) ?? []),
      interaction
    ]);
  }

  return [...groups.entries()]
    .map(([normalizedQuestion, source]) => {
      const ordered = [...source].sort(
        (first, second) =>
          new Date(first.createdAt).getTime() -
          new Date(second.createdAt).getTime()
      );
      const latest = ordered[ordered.length - 1];
      const outcomes = [...new Set(ordered.map(item => item.outcome))] as
        SupportKnowledgeInteractionOutcomeValue[];
      const matchedIntents = [
        ...new Set(
          ordered.flatMap(item => (item.matchedIntent ? [item.matchedIntent] : []))
        )
      ];
      const confidences = ordered.flatMap(item =>
        typeof item.confidence === 'number' ? [item.confidence] : []
      );
      const noMatchCount = ordered.filter(item => item.outcome === 'NO_MATCH').length;
      const clarificationCount = ordered.filter(
        item => item.outcome === 'CLARIFICATION_REQUIRED'
      ).length;
      const contextRequiredCount = ordered.filter(
        item => item.outcome === 'CONTEXT_REQUIRED'
      ).length;
      const humanRequestCount = ordered.filter(
        item => item.humanRequested || item.outcome === 'HUMAN_SUPPORT_REQUIRED'
      ).length;
      const unhelpfulCount = ordered.filter(
        item => item.feedbackHelpful === false
      ).length;
      const suggestedIntent = guideIntent(latest.matchedIntent);
      const reviewScore =
        ordered.length * 2 +
        noMatchCount * 5 +
        unhelpfulCount * 5 +
        humanRequestCount * 4 +
        clarificationCount * 2 +
        contextRequiredCount * 2;

      return {
        id: normalizedQuestion,
        normalizedQuestion,
        representativeQuestion: latest.question,
        occurrences: ordered.length,
        noMatchCount,
        clarificationCount,
        contextRequiredCount,
        humanRequestCount,
        unhelpfulCount,
        averageConfidence: confidences.length
          ? Number(
              (
                confidences.reduce((total, value) => total + value, 0) /
                confidences.length
              ).toFixed(3)
            )
          : null,
        matchedIntents,
        outcomes,
        sampleQuestions: [...new Set(ordered.slice(-5).map(item => item.question))],
        pathnames: [
          ...new Set(ordered.flatMap(item => (item.pathname ? [item.pathname] : [])))
        ].slice(0, 5),
        firstSeenAt: ordered[0].createdAt,
        lastSeenAt: latest.createdAt,
        suggestedTitle: titleFromQuestion(latest.question),
        suggestedSlug:
          slugifySupportKnowledge(latest.question) || 'new-support-knowledge',
        suggestedCategory: CATEGORY_BY_INTENT[suggestedIntent] ?? 'GENERAL',
        suggestedIntent,
        reviewScore,
        reviewReason: reviewReason({
          noMatchCount,
          clarificationCount,
          contextRequiredCount,
          humanRequestCount,
          unhelpfulCount
        })
      };
    })
    .sort(
      (first, second) =>
        second.reviewScore - first.reviewScore ||
        new Date(second.lastSeenAt).getTime() -
          new Date(first.lastSeenAt).getTime()
    )
    .slice(0, Math.max(1, limit));
}
