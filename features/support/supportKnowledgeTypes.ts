export const SUPPORT_KNOWLEDGE_STATUSES = [
  'DRAFT',
  'ACTIVE',
  'ARCHIVED'
] as const;

export type SupportKnowledgeStatusValue =
  (typeof SUPPORT_KNOWLEDGE_STATUSES)[number];

export const SUPPORT_KNOWLEDGE_INTERACTION_OUTCOMES = [
  'ANSWERED',
  'CLARIFICATION_REQUIRED',
  'CONTEXT_REQUIRED',
  'HUMAN_SUPPORT_REQUIRED',
  'NO_MATCH'
] as const;

export type SupportKnowledgeInteractionOutcomeValue =
  (typeof SUPPORT_KNOWLEDGE_INTERACTION_OUTCOMES)[number];

export type SupportKnowledgeActionDefinition = {
  id: string;
  label: string;
  kind: 'NAVIGATE' | 'FOLLOW_UP' | 'HUMAN_HANDOFF';
  href?: string;
  prompt?: string;
};

export type SupportKnowledgeConditionDefinition = {
  all?: string[];
  any?: string[];
  none?: string[];
};

export type SupportKnowledgeQuestionExampleInput = {
  text: string;
  locale?: string;
  weight?: number;
};

export type SupportKnowledgeSeedEntry = {
  slug: string;
  title: string;
  category: string;
  intent: string;
  primaryQuestion: string;
  answerTemplate: string;
  clarificationAnswer?: string | null;
  escalationAnswer?: string | null;
  keywords: string[];
  synonyms?: string[];
  requiredContext?: string[];
  conditions?: SupportKnowledgeConditionDefinition | null;
  actions?: SupportKnowledgeActionDefinition[];
  status?: SupportKnowledgeStatusValue;
  priority?: number;
  confidenceThreshold?: number;
  version?: number;
  examples: SupportKnowledgeQuestionExampleInput[];
};

export type SupportKnowledgeQuestionExampleSnapshot = {
  id: string;
  text: string;
  normalizedText: string;
  locale: string;
  weight: number;
  active: boolean;
};

export type SupportKnowledgeEntrySnapshot = {
  id: string;
  workspaceId: string;
  slug: string;
  title: string;
  category: string;
  intent: string;
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
  questionExamples: SupportKnowledgeQuestionExampleSnapshot[];
};

export type RecordSupportKnowledgeInteractionInput = {
  workspaceId: string;
  customerId?: string | null;
  supportCaseId?: string | null;
  entryId?: string | null;
  question: string;
  matchedIntent?: string | null;
  confidence?: number | null;
  outcome: SupportKnowledgeInteractionOutcomeValue;
  answer?: string | null;
  feedbackHelpful?: boolean | null;
  feedbackReason?: string | null;
  humanRequested?: boolean;
  pathname?: string | null;
  metadata?: Record<string, unknown> | null;
};
