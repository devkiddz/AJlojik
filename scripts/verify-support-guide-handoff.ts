import {
  buildSupportGuideHandoffDraft,
  supportGuideTranscript
} from '../features/support/supportGuideHandoff';

import type {
  SupportGuideMessage,
  SupportGuideResponse
} from '../features/support/supportGuideTypes';

function response(
  overrides:
    Partial<
      SupportGuideResponse
    >
): SupportGuideResponse {
  return {
    outcome:
      'ANSWERED',
    intent:
      'UNKNOWN',
    answer:
      'Approved answer.',
    followUp:
      null,
    confidence:
      'HIGH',
    confidenceScore:
      0.9,
    source:
      'DATABASE_KNOWLEDGE',
    knowledgeEntryId:
      'knowledge-1',
    knowledgeEntrySlug:
      'knowledge',
    interactionId:
      'interaction-1',
    requiredContext:
      [],
    context:
      null,
    actions:
      [],
    shouldOfferHuman:
      false,
    ...overrides
  };
}

function expect(
  condition:
    unknown,
  message:
    string
): asserts condition {
  if (!condition) {
    throw new Error(
      message
    );
  }
}

const orderDraft =
  buildSupportGuideHandoffDraft(
    response({
      intent:
        'ORDER_TRACKING',
      context: {
        state:
          'RESOLVED',
        resolved: [
          'order'
        ],
        missing:
          [],
        ambiguous:
          [],
        summary: [
          'Order AJ-1001 is processing.'
        ],
        references: [
          {
            kind:
              'ORDER',
            id:
              'order-1',
            label:
              'AJ-1001',
            status:
              'PROCESSING',
            detail:
              null
          },
          {
            kind:
              'DELIVERY',
            id:
              'delivery-1',
            label:
              'AJD-1001',
            status:
              'PENDING',
            detail:
              null
          }
        ]
      }
    }),
    '/account/orders'
  );

expect(
  orderDraft.category ===
    'ORDER',
  'Order tracking must create an ORDER Support Case.'
);

expect(
  orderDraft.orderId ===
    'order-1',
  'The verified order ID must be carried into handoff.'
);

expect(
  orderDraft.deliveryId ===
    'delivery-1',
  'The verified delivery ID must be carried into handoff.'
);

expect(
  orderDraft.interactionId ===
    'interaction-1',
  'The originating knowledge interaction must be linked.'
);

expect(
  orderDraft.metadata
    .guideIntent ===
    'ORDER_TRACKING',
  'Handoff metadata must retain the Guide intent.'
);

const paymentDraft =
  buildSupportGuideHandoffDraft(
    response({
      intent:
        'PAYMENT_HELP'
    }),
    '/account/orders'
  );

expect(
  paymentDraft.category ===
    'PAYMENT',
  'Payment help must create a PAYMENT Support Case.'
);

expect(
  paymentDraft.priority ===
    'HIGH',
  'Payment handoff must receive high priority.'
);

const greetingDraft =
  buildSupportGuideHandoffDraft(
    response({
      intent:
        'GREETING'
    }),
    '/store'
  );

expect(
  greetingDraft.category ===
    'OTHER',
  'Greeting handoff must remain a general Support Case.'
);

const fallbackDraft =
  buildSupportGuideHandoffDraft(
    response({
      source:
        'SYSTEM_FALLBACK'
    }),
    null
  );

expect(
  fallbackDraft.priority ===
    'HIGH',
  'System fallback handoff must be prioritised.'
);

const messages:
  SupportGuideMessage[] = [
    {
      id:
        'one',
      role:
        'CUSTOMER',
      body:
        'Where is my order?',
      createdAt:
        new Date(
          0
        ).toISOString()
    },
    {
      id:
        'two',
      role:
        'GUIDE',
      body:
        'Order AJ-1001 is processing.',
      createdAt:
        new Date(
          0
        ).toISOString()
    }
  ];

const transcript =
  supportGuideTranscript(
    messages
  );

expect(
  transcript.includes(
    'Customer: Where is my order?'
  ),
  'The customer message must be preserved in the handoff transcript.'
);

expect(
  transcript.includes(
    'AJ Support Intelligence: Order AJ-1001 is processing.'
  ),
  'The Guide answer must be preserved in the handoff transcript.'
);

expect(
  transcript.length <=
    5100,
  'The handoff transcript must remain inside the Support Case description boundary.'
);

console.log(
  'AJ Logik Support Guide human handoff is complete.'
);

console.log(
  'Validated intent-to-case routing, verified context transfer, knowledge interaction linkage and bounded transcript continuity.'
);
