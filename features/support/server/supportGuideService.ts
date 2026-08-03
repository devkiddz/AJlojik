import 'server-only';

import {
  prisma
} from '@/lib/prisma';

import {
  SUPPORT_GUIDE_INTENTS,
  type SupportGuideAction,
  type SupportGuideIntent,
  type SupportGuideRequest,
  type SupportGuideResponse
} from '../supportGuideTypes';

import {
  supportGuideKnowledge
} from './supportGuideKnowledge';

const MAX_QUESTION_LENGTH =
  1000;


const MIN_DATABASE_MATCH_SCORE =
  8;

function normalizedSearchText(
  value: string
): string {
  return value
    .toLocaleLowerCase('en-NG')
    .replace(
      /[^a-z0-9\s-]+/g,
      ' '
    )
    .replace(
      /\s+/g,
      ' '
    )
    .trim();
}

function searchTokens(
  value: string
): Set<string> {
  return new Set(
    normalizedSearchText(value)
      .split(' ')
      .filter(token => token.length > 1)
  );
}

function isSupportGuideIntent(
  value: string
): value is SupportGuideIntent {
  return (
    SUPPORT_GUIDE_INTENTS as readonly string[]
  ).includes(value);
}

function parseKnowledgeActions(
  value: unknown
): SupportGuideAction[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap(item => {
    if (
      !item ||
      typeof item !== 'object'
    ) {
      return [];
    }

    const candidate =
      item as Record<string, unknown>;

    const kind =
      candidate.kind;

    if (
      kind !== 'NAVIGATE' &&
      kind !== 'FOLLOW_UP' &&
      kind !== 'HUMAN_HANDOFF'
    ) {
      return [];
    }

    if (
      typeof candidate.id !== 'string' ||
      typeof candidate.label !== 'string'
    ) {
      return [];
    }

    return [
      {
        id: candidate.id,
        label: candidate.label,
        kind,
        href:
          typeof candidate.href === 'string'
            ? candidate.href
            : undefined,
        prompt:
          typeof candidate.prompt === 'string'
            ? candidate.prompt
            : undefined
      }
    ];
  });
}

function knowledgeMatchScore(
  question: string,
  entry: {
    intent: string;
    title: string;
    keywords: string[];
    sampleQuestions: string[];
    priority: number;
  }
): number {
  const normalized =
    normalizedSearchText(question);

  const tokens =
    searchTokens(question);

  let score =
    Math.max(
      0,
      entry.priority
    );

  for (
    const sampleQuestion of
    entry.sampleQuestions
  ) {
    const sample =
      normalizedSearchText(
        sampleQuestion
      );

    if (!sample) {
      continue;
    }

    if (sample === normalized) {
      score += 100;
      continue;
    }

    if (
      normalized.includes(sample) ||
      sample.includes(normalized)
    ) {
      score += 30;
    }

    for (
      const token of
      searchTokens(sampleQuestion)
    ) {
      if (tokens.has(token)) {
        score += 3;
      }
    }
  }

  for (
    const keyword of
    entry.keywords
  ) {
    const normalizedKeyword =
      normalizedSearchText(keyword);

    if (!normalizedKeyword) {
      continue;
    }

    if (
      normalized.includes(
        normalizedKeyword
      )
    ) {
      score += 8;
    }

    if (
      tokens.has(
        normalizedKeyword
      )
    ) {
      score += 4;
    }
  }

  for (
    const token of
    searchTokens(
      `${entry.intent} ${entry.title}`
    )
  ) {
    if (tokens.has(token)) {
      score += 2;
    }
  }

  return score;
}

async function databaseKnowledgeResponse(
  workspaceId: string,
  question: string,
  pathname:
    | string
    | null
    | undefined
): Promise<SupportGuideResponse | null> {
  const entries =
    await prisma.supportKnowledgeEntry.findMany({
      where: {
        workspaceId,
        active: true,
        verified: true,
        bucket: {
          active: true
        }
      },
      select: {
        id: true,
        intent: true,
        title: true,
        answer: true,
        followUp: true,
        keywords: true,
        sampleQuestions: true,
        actions: true,
        priority: true
      },
      orderBy: [
        {
          priority: 'desc'
        },
        {
          updatedAt: 'desc'
        }
      ]
    });

  const ranked =
    entries
      .map(entry => ({
        entry,
        score:
          knowledgeMatchScore(
            question,
            entry
          )
      }))
      .sort(
        (left, right) =>
          right.score -
          left.score
      );

  const best =
    ranked[0];

  if (
    !best ||
    best.score <
      MIN_DATABASE_MATCH_SCORE ||
    !isSupportGuideIntent(
      best.entry.intent
    )
  ) {
    return null;
  }

  const actions =
    parseKnowledgeActions(
      best.entry.actions
    );

  const context =
    routeContext(
      pathname
    );

  return {
    intent:
      best.entry.intent,
    answer:
      context
        ? `${best.entry.answer}\n\n${context}`
        : best.entry.answer,
    followUp:
      best.entry.followUp,
    confidence:
      best.score >= 30
        ? 'HIGH'
        : 'MEDIUM',
    source:
      context
        ? 'LIVE_CONTEXT'
        : 'DATABASE_KNOWLEDGE',
    shouldOfferHuman:
      best.entry.intent ===
        'HUMAN_SUPPORT' ||
      actions.some(
        action =>
          action.kind ===
          'HUMAN_HANDOFF'
      ),
    actions
  };
}

function normalizedQuestion(
  value: string
): string {
  const normalized =
    value
      .replace(
        /\s+/g,
        ' '
      )
      .trim();

  if (!normalized) {
    throw new Error(
      'Ask AJ Support Intelligence a question.'
    );
  }

  if (
    normalized.length >
    MAX_QUESTION_LENGTH
  ) {
    throw new Error(
      'Support Intelligence questions must not exceed 1000 characters.'
    );
  }

  return normalized;
}

function routeContext(
  pathname:
    string |
    null |
    undefined
): string | null {
  if (!pathname) {
    return null;
  }

  if (
    pathname.startsWith(
      '/store'
    )
  ) {
    return 'You are currently inside the Store, so you can continue browsing from the page already open.';
  }

  if (
    pathname.startsWith(
      '/cart'
    )
  ) {
    return 'You are currently inside your cart, so review the items and quantities already shown before continuing.';
  }

  if (
    pathname.includes(
      '/orders'
    )
  ) {
    return 'You are currently inside the Orders experience. Open the relevant order before relying on any status or payment conclusion.';
  }

  if (
    pathname.includes(
      '/deliver'
    )
  ) {
    return 'You are currently inside the Delivery experience. The latest confirmed delivery record on that page remains authoritative.';
  }

  if (
    pathname.includes(
      'shopping-list'
    )
  ) {
    return 'You are currently inside Shopping Lists, where you can continue an existing plan or create another one.';
  }

  return null;
}

async function multivendorResponse(
  workspaceId: string
): Promise<SupportGuideResponse> {
  const activeVendorCount =
    await prisma.vendorProfile.count({
      where: {
        workspaceId,
        active:
          true,
        status:
          'ACTIVE'
      }
    });

  const currentState =
    activeVendorCount >
    1
      ? `This marketplace currently has ${activeVendorCount} active approved vendors.`
      : activeVendorCount ===
          1
        ? 'The platform supports multiple approved vendors, while this marketplace currently has one active vendor.'
        : 'The platform supports multiple approved vendors, although no active vendor listing is currently available in this workspace.';

  return {
    intent:
      'MULTIVENDOR_AVAILABILITY',
    answer:
      `Yes—AJ Logik is built as a multivendor commerce platform. Customers can discover products from approved sellers through one marketplace experience. Vendor preparation or fulfilment may still be separated where necessary, and the order details should show the applicable arrangement. ${currentState}`,
    followUp:
      'Are you asking as a customer shopping from several vendors, or as a business interested in becoming a vendor?',
    confidence:
      'HIGH',
    source:
      'LIVE_CONTEXT',
    shouldOfferHuman:
      false,
    actions: [
      {
        id:
          'browse-marketplace',
        label:
          'Browse marketplace',
        href:
          '/store',
        kind:
          'NAVIGATE'
      },
      {
        id:
          'vendor-question',
        label:
          'Ask about vendors',
        kind:
          'FOLLOW_UP',
        prompt:
          'How do vendors work on AJ Logik?'
      }
    ]
  };
}

export async function resolveSupportGuideQuestion(
  input:
    SupportGuideRequest & {
      workspaceId: string;
    }
): Promise<SupportGuideResponse> {
  const question =
    normalizedQuestion(
      input.question
    );

  if (
    /\b(multi[\s-]?vendor|many vendors|different vendors|different sellers)\b/i.test(
      question
    )
  ) {
    return multivendorResponse(
      input.workspaceId
    );
  }

  const databaseResponse =
    await databaseKnowledgeResponse(
      input.workspaceId,
      question,
      input.pathname
    );

  if (databaseResponse) {
    return databaseResponse;
  }

  const entry =
    supportGuideKnowledge.find(
      item =>
        item.patterns.some(
          pattern =>
            pattern.test(
              question
            )
        )
    );

  if (!entry) {
    return {
      intent:
        'UNKNOWN',
      answer:
        'I understand the question, but I could not confirm a safe AJ Logik answer from the approved Guide knowledge yet.',
      followUp:
        'Could you tell me whether this is about shopping, payment, an order, delivery, your account, or using the app?',
      confidence:
        'LOW',
      source:
        'CLARIFICATION',
      shouldOfferHuman:
        true,
      actions: [
        {
          id:
            'clarify-shopping',
          label:
            'Shopping help',
          kind:
            'FOLLOW_UP',
          prompt:
            'How do I buy on AJ Logik?'
        },
        {
          id:
            'clarify-order',
          label:
            'Order help',
          kind:
            'FOLLOW_UP',
          prompt:
            'Help me find my order.'
        },
        {
          id:
            'clarify-human',
          label:
            'Talk to a human',
          kind:
            'HUMAN_HANDOFF'
        }
      ]
    };
  }

  const context =
    routeContext(
      input.pathname
    );

  return {
    intent:
      entry.intent,
    answer:
      context
        ? `${entry.answer}\n\n${context}`
        : entry.answer,
    followUp:
      entry.followUp,
    confidence:
      'HIGH',
    source:
      context
        ? 'LIVE_CONTEXT'
        : 'APP_KNOWLEDGE',
    shouldOfferHuman:
      entry.intent ===
        'HUMAN_SUPPORT' ||
      entry.actions.some(
        action =>
          action.kind ===
          'HUMAN_HANDOFF'
      ),
    actions: [
      ...entry.actions
    ]
  };
}
