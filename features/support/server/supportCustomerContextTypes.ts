export const SUPPORT_CUSTOMER_CONTEXT_KEYS = [
  'customer',
  'order',
  'payment',
  'delivery',
  'product',
  'location',
  'verification'
] as const;

export type SupportCustomerContextKey =
  (typeof SUPPORT_CUSTOMER_CONTEXT_KEYS)[number];

export type SupportCustomerIdentityContext = {
  customerId: string;
  name: string;
  accountState: string;
  emailVerified: boolean;
  workspaceId: string;
  workspaceName: string;
  currency: string;
};

export type SupportCustomerPaymentCandidate = {
  id: string;
  reference: string;
  amount: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
};

export type SupportCustomerDeliveryCandidate = {
  id: string;
  trackingCode: string;
  method: string;
  status: string;
  estimatedArrival: string | null;
  pickedUpAt: string | null;
  deliveredAt: string | null;
  lastLocationAt: string | null;
  updatedAt: string;
};

export type SupportCustomerOrderItemCandidate = {
  productId: string;
  variantId: string;
  productName: string;
  variantLabel: string;
  quantity: number;
};

export type SupportCustomerOrderCandidate = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: unknown;
  createdAt: string;
  updatedAt: string;
  payments: SupportCustomerPaymentCandidate[];
  delivery: SupportCustomerDeliveryCandidate | null;
  items: SupportCustomerOrderItemCandidate[];
};

export type SupportCustomerProductVariantCandidate = {
  id: string;
  label: string;
  sku: string | null;
  active: boolean;
  price: number;
  quantity: number | null;
  reserved: number | null;
  availableQuantity: number | null;
};

export type SupportCustomerProductCandidate = {
  id: string;
  slug: string;
  name: string;
  active: boolean;
  status: string;
  estimatedDelivery: string | null;
  variants: SupportCustomerProductVariantCandidate[];
};

export type SupportCustomerLocationContext = {
  source: 'SAVED_ADDRESS' | 'ORDER_ADDRESS';
  city: string | null;
  state: string | null;
  country: string | null;
};

export type SupportContextSelectionReason =
  | 'EXPLICIT_REFERENCE'
  | 'SINGLE_ACTIVE_ORDER'
  | 'SINGLE_RELEVANT_PAYMENT'
  | 'SINGLE_ACTIVE_DELIVERY'
  | 'SINGLE_ORDER'
  | 'EXACT_PRODUCT'
  | 'SINGLE_PRODUCT'
  | 'MULTIPLE_CANDIDATES'
  | 'NO_CANDIDATES';

export type SupportContextSelection<T> = {
  state: 'SELECTED' | 'AMBIGUOUS' | 'MISSING';
  selected: T | null;
  candidates: T[];
  reason: SupportContextSelectionReason;
};
