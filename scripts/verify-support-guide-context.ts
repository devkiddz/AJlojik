import {
  resolveSupportContextualIntent
} from '../features/support/server/supportCustomerContextIntent';

import {
  extractSupportProductClues,
  selectSupportOrderContext,
  selectSupportProductContext
} from '../features/support/server/supportCustomerContextSelection';

import type {
  SupportCustomerOrderCandidate,
  SupportCustomerProductCandidate
} from '../features/support/server/supportCustomerContextTypes';

function fail(
  message: string
): never {
  throw new Error(
    message
  );
}

function expect(
  condition: unknown,
  message: string
): void {
  if (!condition) {
    fail(
      message
    );
  }
}

function order(
  input: {
    id: string;
    orderNumber: string;
    status?: string;
    paymentStatus?: string;
    paymentReference?: string;
    deliveryTrackingCode?: string;
    deliveryStatus?: string;
  }
): SupportCustomerOrderCandidate {
  return {
    id:
      input.id,
    orderNumber:
      input.orderNumber,
    status:
      input.status ??
      'PROCESSING',
    paymentStatus:
      input.paymentStatus ??
      'PENDING',
    subtotal:
      10000,
    deliveryFee:
      1000,
    total:
      11000,
    deliveryAddress:
      {
        city:
          'Lagos',
        state:
          'Lagos',
        country:
          'Nigeria'
      },
    createdAt:
      '2026-08-03T10:00:00.000Z',
    updatedAt:
      '2026-08-03T10:30:00.000Z',
    payments:
      input.paymentReference
        ? [
            {
              id:
                `payment-${input.id}`,
              reference:
                input.paymentReference,
              amount:
                11000,
              status:
                input.paymentStatus ??
                'PENDING',
              paidAt:
                null,
              createdAt:
                '2026-08-03T10:05:00.000Z'
            }
          ]
        : [],
    delivery:
      input.deliveryTrackingCode
        ? {
            id:
              `delivery-${input.id}`,
            trackingCode:
              input.deliveryTrackingCode,
            method:
              'AJ_DELIVERY',
            status:
              input.deliveryStatus ??
              'IN_TRANSIT',
            estimatedArrival:
              '2026-08-03T15:00:00.000Z',
            pickedUpAt:
              null,
            deliveredAt:
              null,
            lastLocationAt:
              '2026-08-03T11:00:00.000Z',
            updatedAt:
              '2026-08-03T11:00:00.000Z'
          }
        : null,
    items: [
      {
        productId:
          'product-1',
        variantId:
          'variant-1',
        productName:
          'Test Wine',
        variantLabel:
          '75cl',
        quantity:
          1
      }
    ]
  };
}

function product(
  input: {
    id: string;
    slug: string;
    name: string;
    availableQuantity?: number | null;
  }
): SupportCustomerProductCandidate {
  return {
    id:
      input.id,
    slug:
      input.slug,
    name:
      input.name,
    active:
      true,
    status:
      'PUBLISHED',
    estimatedDelivery:
      'Same day',
    variants: [
      {
        id:
          `variant-${input.id}`,
        label:
          '75cl',
        sku:
          `SKU-${input.id}`,
        active:
          true,
        price:
          25000,
        quantity:
          input.availableQuantity ??
          10,
        reserved:
          0,
        availableQuantity:
          input.availableQuantity ??
          10
      }
    ]
  };
}

const first =
  order({
    id:
      'order-1',
    orderNumber:
      'AJ-1001',
    paymentReference:
      'PAY-AJ-1001',
    deliveryTrackingCode:
      'TRACK-1001'
  });

const second =
  order({
    id:
      'order-2',
    orderNumber:
      'AJ-1002',
    status:
      'DELIVERED',
    paymentStatus:
      'PAID',
    paymentReference:
      'PAY-AJ-1002',
    deliveryTrackingCode:
      'TRACK-1002',
    deliveryStatus:
      'DELIVERED'
  });

const explicitOrder =
  selectSupportOrderContext({
    question:
      'Where is order AJ-1002?',
    intent:
      'ORDER_TRACKING',
    orders: [
      first,
      second
    ]
  });

expect(
  explicitOrder.state ===
    'SELECTED' &&
  explicitOrder.selected
    ?.id ===
    second.id &&
  explicitOrder.reason ===
    'EXPLICIT_REFERENCE',
  'Explicit order-number selection failed.'
);

const explicitTracking =
  selectSupportOrderContext({
    question:
      'Please check TRACK-1001',
    intent:
      'DELIVERY_HELP',
    orders: [
      first,
      second
    ]
  });

expect(
  explicitTracking.selected
    ?.id ===
    first.id,
  'Tracking-code selection failed.'
);

const explicitPayment =
  selectSupportOrderContext({
    question:
      'Payment PAY-AJ-1002 is confusing',
    intent:
      'PAYMENT_HELP',
    orders: [
      first,
      second
    ]
  });

expect(
  explicitPayment.selected
    ?.id ===
    second.id,
  'Payment-reference selection failed.'
);

const singleActive =
  selectSupportOrderContext({
    question:
      'Where is my order?',
    intent:
      'ORDER_TRACKING',
    orders: [
      first,
      second
    ]
  });

expect(
  singleActive.selected
    ?.id ===
    first.id &&
  singleActive.reason ===
    'SINGLE_ACTIVE_ORDER',
  'Single active order selection failed.'
);

const ambiguousOrders =
  selectSupportOrderContext({
    question:
      'Where is my order?',
    intent:
      'ORDER_TRACKING',
    orders: [
      first,
      {
        ...first,
        id:
          'order-3',
        orderNumber:
          'AJ-1003'
      }
    ]
  });

expect(
  ambiguousOrders.state ===
    'AMBIGUOUS' &&
  ambiguousOrders.candidates
    .length ===
    2,
  'Multiple active orders should require clarification.'
);

const missingOrder =
  selectSupportOrderContext({
    question:
      'Where is my order?',
    intent:
      'ORDER_TRACKING',
    orders:
      []
  });

expect(
  missingOrder.state ===
    'MISSING',
  'Missing order context was not detected.'
);

const clues =
  extractSupportProductClues(
    'Is Moët Nectar Impérial 75cl still available?'
  );

expect(
  clues.includes(
    'moet'
  ) &&
  clues.includes(
    'nectar'
  ) &&
  clues.includes(
    'imperial'
  ),
  'Product clue extraction failed.'
);

const moet =
  product({
    id:
      'product-moet',
    slug:
      'moet-nectar-imperial',
    name:
      'Moët & Chandon Nectar Impérial'
  });

const martell =
  product({
    id:
      'product-martell',
    slug:
      'martell-blue-swift',
    name:
      'Martell Blue Swift'
  });

const exactProduct =
  selectSupportProductContext({
    question:
      'Is Moët & Chandon Nectar Impérial available?',
    products: [
      moet,
      martell
    ]
  });

expect(
  exactProduct.state ===
    'SELECTED' &&
  exactProduct.selected
    ?.id ===
    moet.id,
  'Exact product selection failed.'
);

const ambiguousProducts =
  selectSupportProductContext({
    question:
      'Is the drink available?',
    products: [
      moet,
      martell
    ]
  });

expect(
  ambiguousProducts.state ===
    'AMBIGUOUS',
  'Multiple product candidates should require clarification.'
);

const productIntent =
  resolveSupportContextualIntent(
    'Is Moët available?'
  );

expect(
  productIntent
    ?.intent ===
    'PRODUCT_AVAILABILITY',
  'Entity-led product availability intent was not recognised.'
);

const orderIntent =
  resolveSupportContextualIntent(
    'Where is AJ-1001?'
  );

expect(
  orderIntent
    ?.intent ===
    'ORDER_TRACKING',
  'Entity-led order tracking intent was not recognised.'
);

const paymentIntent =
  resolveSupportContextualIntent(
    'I was debited for AJ-1001'
  );

expect(
  paymentIntent
    ?.intent ===
    'PAYMENT_HELP',
  'Payment context intent was not recognised.'
);

const unrelatedIntent =
  resolveSupportContextualIntent(
    'Write a birthday poem'
  );

expect(
  unrelatedIntent ===
    null,
  'Unrelated content must not receive a contextual Support intent.'
);

console.log(
  'AJ Logik Support customer-context selection is complete.'
);

console.log(
  'Validated explicit order, tracking and payment references, safe order inference, ambiguity protection, product identification and entity-led contextual intent routing.'
);
