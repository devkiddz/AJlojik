export type CommerceWorkspaceMode =
  | 'LIVE'
  | 'DEMO'
  | 'PRACTICE'
  | 'SANDBOX';

export type CommerceOrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'READY'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type CommercePaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED';

export type CommerceDeliveryStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'BARCODE_SCANNED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'ARRIVED'
  | 'DELIVERED'
  | 'FAILED'
  | 'CANCELLED';

export type CommerceProduct = {
  id: string;
  slug: string;
  name: string;

  categorySlug: string;
  brandSlug: string | null;

  image: string | null;

  price: number;
  compareAtPrice: number | null;

  available: boolean;
  stockLeft: number;

  rating: number;
  soldCount: number;

  featured: boolean;
  isNew: boolean;
};

export type CommerceCartItem = {
  id: string;

  product: CommerceProduct;

  variantId: string;
  variantLabel: string;

  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type CommerceOrderItem = {
  id: string;

  productId: string;
  productSlug: string;

  productName: string;
  variantLabel: string;

  image: string | null;

  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type CommerceDeliveryEvent = {
  status: CommerceDeliveryStatus;
  note: string | null;
  createdAt: string;
};

export type CommerceDelivery = {
  method:
    | 'AJ_DELIVERY'
    | 'PERSONAL_COURIER'
    | 'STORE_PICKUP';

  status: CommerceDeliveryStatus;

  trackingCode: string;
  trackingEnabled: boolean;

  estimatedArrival: string | null;
  pickedUpAt: string | null;
  deliveredAt: string | null;

  events: CommerceDeliveryEvent[];
};

export type CommerceOrder = {
  id: string;
  orderNumber: string;

  status: CommerceOrderStatus;
  paymentStatus: CommercePaymentStatus;

  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  total: number;

  createdAt: string;

  items: CommerceOrderItem[];

  paymentReference: string | null;
  paidAt: string | null;

  delivery: CommerceDelivery | null;
};

export type CommerceHistoryEntry = {
  id: string;

  label: string;
  subtitle: string | null;

  categorySlug: string;

  source:
    | 'CATEGORY'
    | 'DISCOVERY_HUB'
    | 'SMART_PICK'
    | 'CAMPAIGN'
    | 'SEARCH'
    | 'COLLECTION'
    | 'PRODUCT'
    | 'SYSTEM';

  productId: string | null;
  collectionId: string | null;
  campaignId: string | null;

  visitedAt: string;
};

export type CommerceDashboardData = {
  generatedAt: string;

  identity: {
    id: string;

    name: string;
    firstName: string;

    email: string;
    image: string | null;

    tier: string;
    emailVerified: boolean;

    memberSince: string;
  };

  workspace: {
    id: string;
    slug: string;
    name: string;

    mode: CommerceWorkspaceMode;
    role: string;

    wallet: {
      currency: string;
      balance: number;
    } | null;
  };

  profile: {
    persona: string;

    personalizationEnabled: boolean;
    onboardingCompleted: boolean;

    preferredCategorySlugs: string[];
    preferredBrandSlugs: string[];

    recommendationScore: number;
    engagementScore: number;
    commerceScore: number;

    shoppingListProductIds: string[];
  };

  pulse: {
    paidOrderCount: number;
    activeOrderCount: number;
    deliveredOrderCount: number;

    totalSpent: number;

    cartQuantity: number;
    cartSubtotal: number;

    wishlistCount: number;

    reviewCount: number;
    pendingReviewCount: number;
  };

  cartItems: CommerceCartItem[];

  wishlistProducts: CommerceProduct[];
  recentProducts: CommerceProduct[];
  shoppingListProducts: CommerceProduct[];
  pendingReviewProducts: CommerceProduct[];

  orders: CommerceOrder[];
  history: CommerceHistoryEntry[];

  catalog: CommerceProduct[];
};

export type CommercePriorityKind =
  | 'active-delivery'
  | 'payment-attention'
  | 'order-progress'
  | 'cart-continuation'
  | 'pending-review'
  | 'history-continuation'
  | 'personal-discovery'
  | 'welcome';

export type CommercePriorityExperience = {
  id: string;
  kind: CommercePriorityKind;

  eyebrow: string;
  title: string;
  description: string;

  actionLabel: string;
  href: string;

  secondaryActionLabel?: string;
  secondaryHref?: string;

  image: string | null;

  tone:
    | 'navy'
    | 'wine'
    | 'gold'
    | 'emerald'
    | 'violet';

  statusLabel: string | null;
  progress: number | null;
};

export type CommerceJourneyItem = {
  id: string;

  eyebrow: string;
  title: string;
  description: string;

  href: string;
  actionLabel: string;

  image: string | null;

  badge: string | null;

  tone:
    | 'navy'
    | 'wine'
    | 'gold'
    | 'emerald'
    | 'violet';
};

export type CommerceMix = {
  id: string;

  eyebrow: string;
  title: string;
  description: string;

  reason: string;

  products: CommerceProduct[];

  href: string;
};

export type CommercePulseItem = {
  id:
    | 'purchases'
    | 'saved'
    | 'cart'
    | 'reviews';

  label: string;
  value: string;
  helper: string;

  href: string;
};

export type CommerceHubSignal = {
  id: string;

  groupId:
    | 'home'
    | 'shopping'
    | 'orders'
    | 'rewards'
    | 'ai'
    | 'settings';

  title: string;
  description: string;

  priority: number;

  badge: string | null;

  href: string | null;

  productIds: string[];
};

export type CommerceHubProjection = {
  primaryGroupId:
    | 'home'
    | 'shopping'
    | 'orders'
    | 'rewards'
    | 'ai'
    | 'settings';

  signals: CommerceHubSignal[];
};

export type CommerceAssistantAction = {
  id: string;

  title: string;
  description: string;

  actionLabel: string;
  href: string;

  prompt: string;
};

export type CommerceAssistantContext = {
  greeting: string;
  summary: string;

  workspaceId: string;
  workspaceMode: CommerceWorkspaceMode;

  priorityKind: CommercePriorityKind;

  cartQuantity: number;
  wishlistCount: number;
  activeOrderCount: number;
  pendingReviewCount: number;

  recentProductIds: string[];
  preferredCategorySlugs: string[];

  actions: CommerceAssistantAction[];
};

export type ResolvedCommerceDashboard = {
  data: CommerceDashboardData;

  greeting: string;

  priority: CommercePriorityExperience;
  pulse: CommercePulseItem[];

  journeys: CommerceJourneyItem[];
  mixes: CommerceMix[];

  hub: CommerceHubProjection;
  assistant: CommerceAssistantContext;
};
