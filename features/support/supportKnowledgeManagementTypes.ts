import type {
  SupportGuideIntent
} from './supportGuideTypes';

import type {
  SupportKnowledgeInteractionOutcomeValue,
  SupportKnowledgeStatusValue
} from './supportKnowledgeTypes';

export type SupportKnowledgeStudioBucket = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  priority: number;
  active: boolean;
  entriesCount: number;
};

export type SupportKnowledgeStudioExample = {
  id: string;
  text: string;
  normalizedText: string;
  locale: string;
  weight: number;
  active: boolean;
};

export type SupportKnowledgeEntryPerformance = {
  interactions: number;
  answered: number;
  contextRequired: number;
  humanRequests: number;
  helpful: number;
  unhelpful: number;
};

export type SupportKnowledgeStudioEntry = {
  id: string;
  workspaceId: string;
  bucketId: string | null;
  bucketName: string | null;
  slug: string;
  title: string;
  category: string;
  intent: SupportGuideIntent;
  primaryQuestion: string;
  answerTemplate: string;
  clarificationAnswer: string | null;
  escalationAnswer: string | null;
  keywords: string[];
  synonyms: string[];
  requiredContext: string[];
  conditions: unknown;
  actions: unknown;
  status: SupportKnowledgeStatusValue;
  priority: number;
  confidenceThreshold: number;
  version: number;
  publishedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  questionExamples: SupportKnowledgeStudioExample[];
  performance: SupportKnowledgeEntryPerformance;
};

export type SupportKnowledgeLearningInteraction = {
  id: string;
  question: string;
  normalizedQuestion: string;
  matchedIntent: string | null;
  confidence: number | null;
  outcome: SupportKnowledgeInteractionOutcomeValue;
  feedbackHelpful: boolean | null;
  feedbackReason: string | null;
  humanRequested: boolean;
  pathname: string | null;
  entryId: string | null;
  entryTitle: string | null;
  createdAt: string;
};

export type SupportKnowledgeLearningCandidate = {
  id: string;
  normalizedQuestion: string;
  representativeQuestion: string;
  occurrences: number;
  noMatchCount: number;
  clarificationCount: number;
  contextRequiredCount: number;
  humanRequestCount: number;
  unhelpfulCount: number;
  averageConfidence: number | null;
  matchedIntents: string[];
  outcomes: SupportKnowledgeInteractionOutcomeValue[];
  sampleQuestions: string[];
  pathnames: string[];
  firstSeenAt: string;
  lastSeenAt: string;
  suggestedTitle: string;
  suggestedSlug: string;
  suggestedCategory: string;
  suggestedIntent: SupportGuideIntent;
  reviewScore: number;
  reviewReason: string;
};

export type SupportKnowledgeStudioMetrics = {
  totalEntries: number;
  activeEntries: number;
  draftEntries: number;
  archivedEntries: number;
  totalInteractions: number;
  answeredInteractions: number;
  noMatchInteractions: number;
  contextRequiredInteractions: number;
  humanRequestedInteractions: number;
  helpfulFeedback: number;
  unhelpfulFeedback: number;
  helpfulRate: number | null;
  learningCandidates: number;
};

export type SupportKnowledgeStudioSnapshot = {
  workspaceId: string;
  generatedAt: string;
  metrics: SupportKnowledgeStudioMetrics;
  buckets: SupportKnowledgeStudioBucket[];
  entries: SupportKnowledgeStudioEntry[];
  learningCandidates: SupportKnowledgeLearningCandidate[];
  recentInteractions: SupportKnowledgeLearningInteraction[];
};

export type SupportKnowledgeMutationExample = {
  text: string;
  locale: string;
  weight: number;
  active: boolean;
};

export type SupportKnowledgeMutation = {
  bucketId: string | null;
  slug: string;
  title: string;
  category: string;
  intent: SupportGuideIntent;
  primaryQuestion: string;
  answerTemplate: string;
  clarificationAnswer: string | null;
  escalationAnswer: string | null;
  keywords: string[];
  synonyms: string[];
  requiredContext: string[];
  conditions: Record<string, unknown> | null;
  actions: Array<Record<string, unknown>>;
  status: SupportKnowledgeStatusValue;
  priority: number;
  confidenceThreshold: number;
  examples: SupportKnowledgeMutationExample[];
};
