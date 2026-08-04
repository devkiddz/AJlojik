/* AJ_MS12_CATALOG_BUDGET_GUIDANCE */

import type {
  AIAssistantSessionView
} from './contracts';

export type JourneyQuickReplyOption = {
  label: string;
  value: string;
  helper?: string;
};

export type JourneyBudgetGuidance = {
  options: JourneyQuickReplyOption[];
  context: string;
};

function audienceSize(
  session:
    AIAssistantSessionView
) {
  const sources = [
    ...(
      session.journeyState
        ?.confirmedContext ??
      []
    ),
    ...(
      session.journeyState
        ?.constraints ??
      []
    ),
    ...session.messages
      .filter(
        message =>
          message.role ===
          'USER'
      )
      .map(
        message =>
          message.content
      )
  ];

  for (
    const source of
    sources.reverse()
  ) {
    const match =
      source.match(
        /\b(?:audience\s+size:\s*|for\s+|about\s+|around\s+|hosting\s+|serving\s+)?([0-9]{1,4})\s+(?:people|persons|guests|visitors|friends|customers|attendees|of us)\b/i
      );

    const value =
      Number(
        match?.[1]
      );

    if (
      Number.isInteger(
        value
      ) &&
      value >
        0
    ) {
      return value;
    }
  }

  return null;
}

function livePrices(
  session:
    AIAssistantSessionView
) {
  const seen =
    new Set<string>();

  const prices:
    number[] = [];

  for (
    const message of
    [...session.messages]
      .reverse()
  ) {
    if (
      message.role !==
        'ASSISTANT' ||
      !message.payload
    ) {
      continue;
    }

    for (
      const product of
      message.payload.products
    ) {
      const key =
        product.variantId ??
        product.id;

      if (
        seen.has(
          key
        ) ||
      typeof product.price !==
        'number' ||
      !Number.isFinite(
        product.price
      ) ||
      product.price <=
        0 ||
      product.available <=
        0
      ) {
        continue;
      }

      seen.add(
        key
      );

      prices.push(
        product.price
      );

      if (
        prices.length >=
        24
      ) {
        break;
      }
    }

    if (
      prices.length >=
      24
    ) {
      break;
    }
  }

  return prices.sort(
    (
      left,
      right
    ) =>
      left -
      right
  );
}

function median(
  values:
    number[]
) {
  const middle =
    Math.floor(
      values.length /
        2
    );

  return values.length %
    2
      ? values[
          middle
        ]
      : (
          values[
            middle -
            1
          ] +
          values[
            middle
          ]
        ) /
        2;
}

function roundedMoney(
  value:
    number
) {
  const interval =
    value >=
      500_000
      ? 25_000
      : value >=
          100_000
        ? 10_000
        : 5_000;

  return Math.max(
    interval,
    Math.round(
      value /
        interval
    ) *
      interval
  );
}

function money(
  value:
    number
) {
  return new Intl.NumberFormat(
    'en-NG',
    {
      style:
        'currency',
      currency:
        'NGN',
      maximumFractionDigits:
        0
    }
  ).format(
    value
  );
}

function range(
  minimum:
    number,
  maximum:
    number
) {
  return `${money(
    minimum
  )}–${money(
    maximum
  )}`;
}

export function resolveJourneyBudgetGuidance(
  session:
    AIAssistantSessionView |
    null
): JourneyBudgetGuidance | null {
  const question =
    session
      ?.journeyState
      ?.unresolvedQuestions[0] ??
    '';

  if (
    !session ||
    !/\b(?:budget|spend|price|within|cost)\b/i.test(
      question
    )
  ) {
    return null;
  }

  const guests =
    audienceSize(
      session
    );

  const prices =
    livePrices(
      session
    );

  if (
    !guests ||
    prices.length <
      3
  ) {
    return null;
  }

  const servingBundles =
    Math.max(
      1,
      Math.ceil(
        guests /
          4
      )
    );

  const anchor =
    median(
      prices
    ) *
    servingBundles;

  const affordableMinimum =
    roundedMoney(
      anchor *
        0.55
    );

  const affordableMaximum =
    roundedMoney(
      anchor *
        0.8
    );

  const balancedMinimum =
    affordableMaximum;

  const balancedMaximum =
    roundedMoney(
      anchor *
        1.15
    );

  const premiumMinimum =
    balancedMaximum;

  const premiumMaximum =
    roundedMoney(
      anchor *
        1.7
    );

  return {
    options: [
      {
        label:
          'Affordable',
        helper:
          range(
            affordableMinimum,
            affordableMaximum
          ),
        value:
          `My budget is ${affordableMaximum}. Keep it affordable.`
      },
      {
        label:
          'Balanced',
        helper:
          range(
            balancedMinimum,
            balancedMaximum
          ),
        value:
          `My budget is ${balancedMaximum}. Keep it balanced.`
      },
      {
        label:
          'Premium',
        helper:
          range(
            premiumMinimum,
            premiumMaximum
          ),
        value:
          `My budget is ${premiumMaximum}. Make it premium.`
      },
      {
        label:
          'Flexible budget',
        helper:
          'AJ may optimise freely',
        value:
          'My budget is flexible'
      }
    ],
    context:
      `Estimated from ${prices.length} currently available catalogue prices for ${guests} people.`
  };
}
