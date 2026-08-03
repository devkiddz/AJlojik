import type {
  SupportKnowledgeLearningInteraction
} from '../features/support/supportKnowledgeManagementTypes';
import {
  buildSupportKnowledgeLearningCandidates
} from '../features/support/server/supportKnowledgeLearning';
import {
  normalizeSupportKnowledgeList,
  parseSupportKnowledgeMutation,
  slugifySupportKnowledge
} from '../features/support/server/supportKnowledgeManagementValidation';

function expect(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

expect(
  slugifySupportKnowledge("Where's my order?") === 'wheres-my-order',
  'Support Knowledge slugs must be deterministic.'
);

expect(
  normalizeSupportKnowledgeList(['Payment', ' payment ', 'Pending']).length === 2,
  'Support Knowledge lists must remove duplicates.'
);

const mutation = parseSupportKnowledgeMutation({
  title: 'Payment pending',
  slug: '',
  category: 'payment',
  intent: 'PAYMENT_HELP',
  primaryQuestion: 'Why is my payment pending?',
  answerTemplate:
    'AJ Logik will inspect the verified payment state before responding.',
  clarificationAnswer: null,
  escalationAnswer: null,
  keywords: ['payment', 'pending'],
  synonyms: ['transaction pending'],
  requiredContext: ['payment'],
  conditions: null,
  actions: [],
  status: 'ACTIVE',
  priority: 10,
  confidenceThreshold: 0.7,
  examples: [
    {
      text: 'My payment is pending',
      locale: 'en-NG',
      weight: 1,
      active: true
    }
  ]
});

expect(mutation.slug === 'payment-pending', 'A missing slug must use the title.');
expect(mutation.category === 'PAYMENT', 'Categories must be normalized.');

let missingExamplesRejected = false;
try {
  parseSupportKnowledgeMutation({ ...mutation, examples: [] });
} catch {
  missingExamplesRejected = true;
}
expect(
  missingExamplesRejected,
  'Active knowledge without examples must be rejected.'
);

const interactions: SupportKnowledgeLearningInteraction[] = [
  {
    id: 'one',
    question: 'Can I schedule a party delivery?',
    normalizedQuestion: 'can i schedule a party delivery',
    matchedIntent: null,
    confidence: 0.2,
    outcome: 'NO_MATCH',
    feedbackHelpful: null,
    feedbackReason: null,
    humanRequested: false,
    pathname: '/store',
    entryId: null,
    entryTitle: null,
    createdAt: '2026-08-01T10:00:00.000Z'
  },
  {
    id: 'two',
    question: 'Can I schedule a party delivery?',
    normalizedQuestion: 'can i schedule a party delivery',
    matchedIntent: 'PARTY_PLANNING',
    confidence: 0.51,
    outcome: 'CLARIFICATION_REQUIRED',
    feedbackHelpful: false,
    feedbackReason: 'It did not explain scheduling.',
    humanRequested: true,
    pathname: '/store',
    entryId: 'entry-one',
    entryTitle: 'Party planning',
    createdAt: '2026-08-02T10:00:00.000Z'
  },
  {
    id: 'three',
    question: 'Hello',
    normalizedQuestion: 'hello',
    matchedIntent: 'GREETING',
    confidence: 1,
    outcome: 'ANSWERED',
    feedbackHelpful: true,
    feedbackReason: null,
    humanRequested: false,
    pathname: '/store',
    entryId: 'greeting',
    entryTitle: 'Greeting',
    createdAt: '2026-08-02T11:00:00.000Z'
  }
];

const candidates = buildSupportKnowledgeLearningCandidates(interactions);
expect(candidates.length === 1, 'Only review-worthy clusters should appear.');
expect(candidates[0].occurrences === 2, 'Repeated questions must be grouped.');
expect(
  candidates[0].suggestedIntent === 'PARTY_PLANNING',
  'The latest governed intent may be suggested.'
);
expect(
  candidates[0].unhelpfulCount === 1 &&
    candidates[0].humanRequestCount === 1,
  'Feedback and handoff evidence must be retained.'
);
expect(candidates[0].reviewScore > 10, 'Risk evidence must affect priority.');

console.log(
  'AJ Logik Support Knowledge Studio and governed learning loop are complete.'
);
console.log(
  'Validated mutation governance, active-entry safeguards, deterministic normalization and evidence-only learning candidates.'
);
