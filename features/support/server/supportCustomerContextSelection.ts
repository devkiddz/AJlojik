import {
  normalizeSupportKnowledgeText
} from './supportKnowledgeText';

import type {
  SupportContextSelection,
  SupportCustomerOrderCandidate,
  SupportCustomerProductCandidate
} from './supportCustomerContextTypes';

const TERMINAL_ORDER_STATUSES =
  new Set([
    'DELIVERED',
    'CANCELLED',
    'REFUNDED'
  ]);

const TERMINAL_DELIVERY_STATUSES =
  new Set([
    'DELIVERED',
    'FAILED',
    'CANCELLED'
  ]);

const UNRESOLVED_PAYMENT_STATUSES =
  new Set([
    'PENDING',
    'PROCESSING',
    'FAILED'
  ]);

const GENERIC_PRODUCT_WORDS =
  new Set([
    'available',
    'availability',
    'buy',
    'do',
    'does',
    'have',
    'in',
    'is',
    'it',
    'left',
    'product',
    'remain',
    'remaining',
    'stock',
    'still',
    'this',
    'variant',
    'you'
  ]);

function compactReference(
  value: string
): string {
  return normalizeSupportKnowledgeText(
    value
  ).replace(
    /\s+/g,
    ''
  );
}

function referenceAppears(
  question: string,
  pathname: string | null | undefined,
  reference: string | null | undefined
): boolean {
  if (!reference) {
    return false;
  }

  const needle =
    compactReference(
      reference
    );

  if (
    needle.length <
    4
  ) {
    return false;
  }

  const haystack =
    compactReference(
      `${question} ${pathname ?? ''}`
    );

  return haystack.includes(
    needle
  );
}

function uniqueById<T extends {
  id: string;
}>(
  values: readonly T[]
): T[] {
  const seen =
    new Set<string>();

  return values.filter(
    value => {
      if (
        seen.has(
          value.id
        )
      ) {
        return false;
      }

      seen.add(
        value.id
      );

      return true;
    }
  );
}

function selected<T>(
  value: T,
  reason:
    SupportContextSelection<T>['reason']
): SupportContextSelection<T> {
  return {
    state:
      'SELECTED',
    selected:
      value,
    candidates:
      [value],
    reason
  };
}

function ambiguous<T>(
  values: readonly T[]
): SupportContextSelection<T> {
  return {
    state:
      'AMBIGUOUS',
    selected:
      null,
    candidates:
      values.slice(
        0,
        4
      ),
    reason:
      'MULTIPLE_CANDIDATES'
  };
}

function missing<T>():
  SupportContextSelection<T> {
  return {
    state:
      'MISSING',
    selected:
      null,
    candidates:
      [],
    reason:
      'NO_CANDIDATES'
  };
}

export function selectSupportOrderContext(
  input: {
    question: string;
    pathname?: string | null;
    intent: string;
    orders:
      readonly SupportCustomerOrderCandidate[];
  }
): SupportContextSelection<SupportCustomerOrderCandidate> {
  if (
    !input.orders.length
  ) {
    return missing();
  }

  const explicit =
    uniqueById(
      input.orders.filter(
        order =>
          referenceAppears(
            input.question,
            input.pathname,
            order.id
          ) ||
          referenceAppears(
            input.question,
            input.pathname,
            order.orderNumber
          ) ||
          referenceAppears(
            input.question,
            input.pathname,
            order.delivery
              ?.trackingCode
          ) ||
          order.payments.some(
            payment =>
              referenceAppears(
                input.question,
                input.pathname,
                payment.reference
              )
          )
      )
    );

  if (
    explicit.length ===
    1
  ) {
    return selected(
      explicit[0],
      'EXPLICIT_REFERENCE'
    );
  }

  if (
    explicit.length >
    1
  ) {
    return ambiguous(
      explicit
    );
  }

  if (
    input.intent ===
      'PAYMENT_HELP'
  ) {
    const relevant =
      input.orders.filter(
        order =>
          UNRESOLVED_PAYMENT_STATUSES.has(
            order.paymentStatus
          ) ||
          order.payments.some(
            payment =>
              UNRESOLVED_PAYMENT_STATUSES.has(
                payment.status
              )
          )
      );

    if (
      relevant.length ===
      1
    ) {
      return selected(
        relevant[0],
        'SINGLE_RELEVANT_PAYMENT'
      );
    }

    if (
      relevant.length >
      1
    ) {
      return ambiguous(
        relevant
      );
    }
  }

  if (
    input.intent ===
      'DELIVERY_HELP'
  ) {
    const relevant =
      input.orders.filter(
        order =>
          Boolean(
            order.delivery &&
              !TERMINAL_DELIVERY_STATUSES.has(
                order.delivery
                  .status
              )
          )
      );

    if (
      relevant.length ===
      1
    ) {
      return selected(
        relevant[0],
        'SINGLE_ACTIVE_DELIVERY'
      );
    }

    if (
      relevant.length >
      1
    ) {
      return ambiguous(
        relevant
      );
    }
  }

  const activeOrders =
    input.orders.filter(
      order =>
        !TERMINAL_ORDER_STATUSES.has(
          order.status
        )
    );

  if (
    activeOrders.length ===
    1
  ) {
    return selected(
      activeOrders[0],
      'SINGLE_ACTIVE_ORDER'
    );
  }

  if (
    activeOrders.length >
    1
  ) {
    return ambiguous(
      activeOrders
    );
  }

  if (
    input.orders.length ===
    1
  ) {
    return selected(
      input.orders[0],
      'SINGLE_ORDER'
    );
  }

  return ambiguous(
    input.orders
  );
}

export function extractSupportProductClues(
  question: string,
  pathname?: string | null
): string[] {
  const normalized =
    normalizeSupportKnowledgeText(
      question
    );

  const clues =
    normalized
      .split(' ')
      .map(
        value =>
          value.trim()
      )
      .filter(
        value =>
          value.length >=
            3 &&
          !GENERIC_PRODUCT_WORDS.has(
            value
          )
      );

  if (pathname) {
    const segments =
      pathname
        .split('/')
        .map(
          value =>
            value.trim()
        )
        .filter(
          Boolean
        );

    for (
      let index = 1;
      index <
      segments.length;
      index +=
        1
    ) {
      const previous =
        segments[
          index -
            1
        ];

      if (
        previous ===
          'product' ||
        previous ===
          'products'
      ) {
        try {
          const decoded =
            decodeURIComponent(
              segments[
                index
              ]
            );

          clues.push(
            ...normalizeSupportKnowledgeText(
              decoded
            ).split(
              ' '
            )
          );
        } catch {
          clues.push(
            segments[
              index
            ]
          );
        }
      }
    }
  }

  return [
    ...new Set(
      clues.filter(
        value =>
          value.length >=
          3
      )
    )
  ].slice(
    0,
    8
  );
}

function productReferenceAppears(
  question: string,
  pathname: string | null | undefined,
  product:
    SupportCustomerProductCandidate
): boolean {
  if (
    referenceAppears(
      question,
      pathname,
      product.id
    ) ||
    referenceAppears(
      question,
      pathname,
      product.slug
    )
  ) {
    return true;
  }

  const normalizedQuestion =
    normalizeSupportKnowledgeText(
      question
    );

  const normalizedName =
    normalizeSupportKnowledgeText(
      product.name
    );

  if (
    normalizedName.length >=
      4 &&
    normalizedQuestion.includes(
      normalizedName
    )
  ) {
    return true;
  }

  return product.variants.some(
    variant =>
      (
        variant.sku &&
        referenceAppears(
          question,
          pathname,
          variant.sku
        )
      ) ||
      (
        normalizeSupportKnowledgeText(
          variant.label
        ).length >=
          4 &&
        normalizedQuestion.includes(
          normalizeSupportKnowledgeText(
            variant.label
          )
        )
      )
  );
}

export function selectSupportProductContext(
  input: {
    question: string;
    pathname?: string | null;
    products:
      readonly SupportCustomerProductCandidate[];
  }
): SupportContextSelection<SupportCustomerProductCandidate> {
  if (
    !input.products.length
  ) {
    return missing();
  }

  const exact =
    uniqueById(
      input.products.filter(
        product =>
          productReferenceAppears(
            input.question,
            input.pathname,
            product
          )
      )
    );

  if (
    exact.length ===
    1
  ) {
    return selected(
      exact[0],
      'EXACT_PRODUCT'
    );
  }

  if (
    exact.length >
    1
  ) {
    return ambiguous(
      exact
    );
  }

  if (
    input.products.length ===
    1
  ) {
    return selected(
      input.products[0],
      'SINGLE_PRODUCT'
    );
  }

  return ambiguous(
    input.products
  );
}
