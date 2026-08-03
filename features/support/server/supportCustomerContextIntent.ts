import {
  normalizeSupportKnowledgeText
} from './supportKnowledgeText';

export type SupportContextualIntentResolution = {
  intent:
    | 'ORDER_TRACKING'
    | 'PAYMENT_HELP'
    | 'DELIVERY_HELP'
    | 'PRODUCT_AVAILABILITY'
    | 'ALCOHOL_DELIVERY_ELIGIBILITY'
    | 'RETURNS_AND_REFUNDS';
  confidence: number;
  reason: string;
};

function hasSpecificReference(
  normalized: string
): boolean {
  return normalized
    .split(' ')
    .some(
      token =>
        token.length >=
          4 &&
        (
          /\d/.test(
            token
          ) ||
          ![
            'available',
            'availability',
            'check',
            'help',
            'order',
            'package',
            'payment',
            'product',
            'status',
            'track',
            'where'
          ].includes(
            token
          )
        )
    );
}

export function resolveSupportContextualIntent(
  question: string
): SupportContextualIntentResolution | null {
  const normalized =
    normalizeSupportKnowledgeText(
      question
    );

  if (!normalized) {
    return null;
  }

  if (
    /\b(refund|return|wrong item|damaged|money back|replacement)\b/.test(
      normalized
    )
  ) {
    return {
      intent:
        'RETURNS_AND_REFUNDS',
      confidence:
        0.86,
      reason:
        'RETURN_OR_REFUND_ANCHOR'
    };
  }

  if (
    /\b(alcohol|wine|spirits|liquor|liqz|drink)\b/.test(
      normalized
    ) &&
    /\b(deliver|delivery|eligible|eligibility|age|location|here)\b/.test(
      normalized
    )
  ) {
    return {
      intent:
        'ALCOHOL_DELIVERY_ELIGIBILITY',
      confidence:
        0.84,
      reason:
        'ALCOHOL_ELIGIBILITY_ANCHOR'
    };
  }

  if (
    /\b(payment|paid|debit|debited|charged|charge|paystack|transaction)\b/.test(
      normalized
    )
  ) {
    return {
      intent:
        'PAYMENT_HELP',
      confidence:
        0.84,
      reason:
        'PAYMENT_ANCHOR'
    };
  }

  if (
    /\b(delivery|dispatch|dispatcher|driver)\b/.test(
      normalized
    ) ||
    (
      /\b(late|arrive|arrival|missing)\b/.test(
        normalized
      ) &&
      /\b(package|delivery)\b/.test(
        normalized
      )
    )
  ) {
    return {
      intent:
        'DELIVERY_HELP',
      confidence:
        0.8,
      reason:
        'DELIVERY_ANCHOR'
    };
  }

  if (
    (
      /\b(track|tracking|where is|status|when will)\b/.test(
        normalized
      ) &&
      (
        /\b(order|package|purchase)\b/.test(
          normalized
        ) ||
        hasSpecificReference(
          normalized
        )
      )
    ) ||
    /\bwhere my .+ dey\b/.test(
      normalized
    )
  ) {
    return {
      intent:
        'ORDER_TRACKING',
      confidence:
        0.8,
      reason:
        'ORDER_TRACKING_ANCHOR'
    };
  }

  const productExcluded =
    /\b(agent|human|support|vendor|seller|delivery|location|service)\b/.test(
      normalized
    );

  if (
    !productExcluded &&
    (
      /\b(in stock|out of stock|sold out|available|availability)\b/.test(
        normalized
      ) ||
      (
        /\b(do you have|still have|have any)\b/.test(
          normalized
        ) &&
        hasSpecificReference(
          normalized
        )
      )
    )
  ) {
    return {
      intent:
        'PRODUCT_AVAILABILITY',
      confidence:
        0.8,
      reason:
        'PRODUCT_AVAILABILITY_ANCHOR'
    };
  }

  return null;
}
