import 'server-only';

import {
  prisma
} from '@/lib/prisma';

import type {
  SupportGuideRequest,
  SupportGuideResponse
} from '../supportGuideTypes';

import {
  supportGuideKnowledge
} from './supportGuideKnowledge';

const MAX_QUESTION_LENGTH =
  1000;

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
      'Ask AJ Support Guide a question.'
    );
  }

  if (
    normalized.length >
    MAX_QUESTION_LENGTH
  ) {
    throw new Error(
      'Support Guide questions must not exceed 1000 characters.'
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
