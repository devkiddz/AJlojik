export type SerializableValue =
  | null
  | boolean
  | number
  | string
  | SerializableValue[]
  | {
      [key: string]: SerializableValue;
    };

export type WorkspaceOrderItemProjection = {
  id: string;

  productId: string;
  variantId: string;

  productName: string;
  variantLabel: string;

  image: string | null;

  quantity: number;

  unitPrice: number;
  totalPrice: number;
};

export type WorkspaceOrderProjection = {
  id: string;
  orderNumber: string;

  status: string;
  paymentStatus: string;

  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  total: number;

  itemCount: number;
  items: WorkspaceOrderItemProjection[];

  createdAt: string;
  updatedAt: string;
};

export type WorkspaceDeliveryEventProjection = {
  id: string;

  status: string;
  source: string;

  note: string | null;

  createdAt: string;
};

export type WorkspaceDeliveryProjection = {
  id: string;

  orderId: string;
  orderNumber: string;

  method: string;
  status: string;

  trackingCode: string;

  dispatcherName: string | null;
  dispatcherPhone: string | null;

  estimatedArrival: string | null;
  pickedUpAt: string | null;
  deliveredAt: string | null;

  trackingEnabled: boolean;

  lastLocationAt: string | null;

  location: {
    lat: number;
    lng: number;
  } | null;

  events: WorkspaceDeliveryEventProjection[];

  createdAt: string;
  updatedAt: string;
};

export type PendingReviewProjection = {
  productId: string;
  productName: string;

  image: string | null;

  orderId: string;
  orderNumber: string;

  deliveredAt: string;
};

export type ExperienceHistoryProjection = {
  id: string;

  label: string;
  subtitle: string | null;

  categorySlug: string;

  source: string;

  experienceId: string | null;
  campaignId: string | null;
  collectionId: string | null;
  productId: string | null;

  intentSnapshot: SerializableValue;
  contextSnapshot: SerializableValue | null;

  visitedAt: string;
};

export type WorkspaceCommerceProjection = {
  workspaceId: string;

  generatedAt: string;

  orders: {
    recent: WorkspaceOrderProjection[];

    activeDelivery?: WorkspaceDeliveryProjection;
  };

  pendingReviews: PendingReviewProjection[];

  history: ExperienceHistoryProjection[];
};

export type WorkspaceCommerceProjectionResponse = {
  projection: WorkspaceCommerceProjection;
};