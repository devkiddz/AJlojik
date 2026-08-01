export type DeliveryStatusValue =
  | 'PENDING'
  | 'ASSIGNED'
  | 'BARCODE_SCANNED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'ARRIVED'
  | 'DELIVERED'
  | 'FAILED'
  | 'CANCELLED';

export type DeliveryMethodValue =
  | 'AJ_DELIVERY'
  | 'PERSONAL_COURIER'
  | 'STORE_PICKUP';

export type DeliveryEventValue = {
  id: string;
  status: DeliveryStatusValue;
  source: string;
  latitude: number | null;
  longitude: number | null;
  accuracyMeters: number | null;
  note: string | null;
  createdAt: string;
};

export type DeliveryRuntimeValue = {
  id: string;
  workspaceId: string;
  method: DeliveryMethodValue;
  status: DeliveryStatusValue;
  trackingCode: string;
  handoverReady: boolean;
  handoverExpiresAt: string | null;
  trackingEnabled: boolean;
  dispatcherId: string | null;
  dispatcherName: string | null;
  dispatcherPhone: string | null;
  estimatedArrival: string | null;
  pickedUpAt: string | null;
  deliveredAt: string | null;
  lastLatitude: number | null;
  lastLongitude: number | null;
  lastLocationAt: string | null;
  createdAt: string;
  updatedAt: string;
  order: {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    total: number;
    deliveryAddress: unknown;
    createdAt: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
    items: Array<{
      id: string;
      productName: string;
      variantLabel: string;
      image: string | null;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
  };
  events: DeliveryEventValue[];
};

export type DeliveryStaffOption = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type CustomerOrderValue = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: unknown;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    productName: string;
    variantLabel: string;
    image: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  delivery: DeliveryRuntimeValue | null;
};

export type RiderAccessInspection = {
  deliveryId: string;
  trackingCode: string;
  orderNumber: string;
  method: DeliveryMethodValue;
  status: DeliveryStatusValue;
  expiresAt: string;
  dispatcherName: string | null;
  recipientName: string | null;
};

export type RiderSessionValue = {
  delivery: DeliveryRuntimeValue;
  sessionToken: string;
  expiresAt: string;
};
