import {
  AJ_LOGIK_SUPPORT_KNOWLEDGE_SEED
} from '../features/support/server/supportKnowledgeSeedCatalog';

import {
  resolveSupportKnowledgeMatch
} from '../features/support/server/supportKnowledgeMatcher';

import {
  normalizeSupportKnowledgeText
} from '../features/support/server/supportKnowledgeText';

import type {
  SupportKnowledgeEntrySnapshot
} from '../features/support/supportKnowledgeTypes';

const entries:
  SupportKnowledgeEntrySnapshot[] =
  AJ_LOGIK_SUPPORT_KNOWLEDGE_SEED
    .filter(
      entry =>
        (
          entry.status ??
          'ACTIVE'
        ) ===
        'ACTIVE'
    )
    .map(
      (
        entry,
        entryIndex
      ) => ({
        id:
          `verify-entry-${entryIndex}`,
        workspaceId:
          'verify-workspace',
        slug:
          entry.slug,
        title:
          entry.title,
        category:
          entry.category,
        intent:
          entry.intent,
        primaryQuestion:
          entry.primaryQuestion,
        answerTemplate:
          entry.answerTemplate,
        clarificationAnswer:
          entry.clarificationAnswer ??
          null,
        escalationAnswer:
          entry.escalationAnswer ??
          null,
        keywords:
          entry.keywords,
        synonyms:
          entry.synonyms ??
          [],
        requiredContext:
          entry.requiredContext ??
          [],
        conditions:
          entry.conditions ??
          null,
        actions:
          entry.actions ??
          [],
        status:
          'ACTIVE',
        priority:
          entry.priority ??
          0,
        confidenceThreshold:
          entry.confidenceThreshold ??
          0.65,
        version:
          entry.version ??
          1,
        publishedAt:
          new Date(
            0
          ).toISOString(),
        questionExamples:
          entry.examples.map(
            (
              example,
              exampleIndex
            ) => ({
              id:
                `verify-example-${entryIndex}-${exampleIndex}`,
              text:
                example.text,
              normalizedText:
                normalizeSupportKnowledgeText(
                  example.text
                ),
              locale:
                example.locale ??
                'en-NG',
              weight:
                example.weight ??
                1,
              active:
                true
            })
          )
      })
    );

function expectMatch(
  question: string,
  expectedIntent: string,
  expectedSlug?: string
): void {
  const resolution =
    resolveSupportKnowledgeMatch(
      question,
      entries
    );

  if (
    !resolution.best
  ) {
    throw new Error(
      `Expected a match for "${question}", but none qualified.`
    );
  }

  if (
    resolution.ambiguous
  ) {
    throw new Error(
      `Expected an unambiguous match for "${question}".`
    );
  }

  if (
    resolution.best
      .entry
      .intent !==
    expectedIntent
  ) {
    throw new Error(
      `Expected ${expectedIntent} for "${question}", received ${resolution.best.entry.intent}.`
    );
  }

  if (
    expectedSlug &&
    resolution.best
      .entry
      .slug !==
      expectedSlug
  ) {
    throw new Error(
      `Expected ${expectedSlug} for "${question}", received ${resolution.best.entry.slug}.`
    );
  }

  if (
    resolution.best
      .score <
    resolution.best
      .threshold
  ) {
    throw new Error(
      `Match for "${question}" did not satisfy its threshold.`
    );
  }
}

function expectNoMatch(
  question: string
): void {
  const resolution =
    resolveSupportKnowledgeMatch(
      question,
      entries
    );

  if (
    resolution.best
  ) {
    throw new Error(
      `Expected no trustworthy match for "${question}", received ${resolution.best.entry.slug} at ${resolution.best.score}.`
    );
  }
}

for (
  const entry of
  entries
) {
  expectMatch(
    entry.primaryQuestion,
    entry.intent,
    entry.slug
  );

  for (
    const example of
    entry.questionExamples
  ) {
    expectMatch(
      example.text,
      entry.intent,
      entry.slug
    );
  }
}

expectMatch(
  'Hi',
  'GREETING',
  'greeting'
);

expectMatch(
  'Good morning',
  'GREETING',
  'greeting'
);

expectMatch(
  'How far?',
  'GREETING',
  'greeting'
);

expectMatch(
  'How do I buy?',
  'HOW_TO_BUY',
  'how-to-buy'
);

expectMatch(
  'What is AJ Liqz?',
  'HOW_TO_USE_APP',
  'what-is-aj-liqz'
);

expectMatch(
  'Where my wine dey?',
  'ORDER_TRACKING',
  'track-order'
);

expectMatch(
  'Can una deliver drinks reach me?',
  'ALCOHOL_DELIVERY_ELIGIBILITY',
  'alcohol-delivery-eligibility'
);

expectMatch(
  'I do not trust this response',
  'HUMAN_SUPPORT',
  'human-support'
);

expectMatch(
  'My payment is pending',
  'PAYMENT_HELP',
  'payment-help'
);

expectNoMatch(
  'Explain the orbital mechanics of Neptune'
);

expectNoMatch(
  'Write a birthday poem for my neighbour'
);

console.log(
  'AJ Logik Support Guide deterministic database matcher is complete.'
);

console.log(
  `Validated ${entries.length} active knowledge entries and all approved example questions.`
);
