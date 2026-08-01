export type PreparationStatus =
  | 'SUBMITTED'
  | 'IN_PREPARATION'
  | 'AWAITING_CUSTOMER_APPROVAL'
  | 'READY_FOR_CHECKOUT'
  | 'ORDER_CREATED'
  | 'COMPLETED'
  | 'CANCELLED';

export type PreparationCustomerDecision =
  | 'PENDING'
  | 'APPROVED'
  | 'CHANGES_REQUESTED'
  | 'CANCELLED';

export type PreparationItemStatus =
  | 'PENDING'
  | 'AVAILABLE'
  | 'PARTIALLY_AVAILABLE'
  | 'SUBSTITUTED'
  | 'PRICE_CHANGED'
  | 'UNAVAILABLE'
  | 'PREPARED'
  | 'REMOVED';

export type PreparationItemDecision =
  | 'PENDING'
  | 'NOT_REQUIRED'
  | 'APPROVED'
  | 'REJECTED';

export type PreparationProductReference = {
  id: string;
  name: string;
  slug: string;
  vendorProfileId: string | null;
};

export type PreparationVariantReference = {
  id: string;
  productId: string;
  productName: string;
  label: string;
  price: number;
  image: string | null;
  vendorProfileId: string | null;
  availableQuantity: number | null;
};

export type PreparationItemView = {
  id: string;
  sourceShoppingListItemId: string | null;
  originalProduct: PreparationProductReference;
  resolvedProduct: PreparationProductReference | null;
  originalVariant: PreparationVariantReference | null;
  resolvedVariant: PreparationVariantReference | null;
  productName: string;
  originalVariantLabel: string | null;
  resolvedVariantLabel: string | null;
  image: string | null;
  requestedQuantity: number;
  preparedQuantity: number;
  originalUnitPrice: number;
  quotedUnitPrice: number;
  quotedLineTotal: number;
  status: PreparationItemStatus;
  customerDecision: PreparationItemDecision;
  substitutionReason: string | null;
  staffNote: string | null;
  customerNote: string | null;
  position: number;
  resolvedAt: string | null;
  customerRespondedAt: string | null;
  updatedAt: string;
};

export type PreparationEventView = {
  id: string;
  actorName: string | null;
  type: string;
  fromStatus: PreparationStatus | null;
  toStatus: PreparationStatus | null;
  note: string | null;
  createdAt: string;
};

export type PreparationView = {
  id: string;
  workspaceId: string;
  workspaceName: string;
  workspaceMode: 'LIVE' | 'DEMO' | 'PRACTICE' | 'SANDBOX';
  shoppingListId: string;
  shoppingListName: string;
  shoppingListDescription: string | null;
  userId: string;
  customerName: string;
  customerEmail: string;
  assignedStaffId: string | null;
  assignedStaffName: string | null;
  orderId: string | null;
  orderNumber: string | null;
  orderStatus: string | null;
  paymentStatus: string | null;
  status: PreparationStatus;
  customerDecision: PreparationCustomerDecision;
  priority: number;
  customerNote: string | null;
  staffNote: string | null;
  customerDecisionNote: string | null;
  originalEstimatedTotal: number;
  quotedSubtotal: number;
  approvedTotal: number | null;
  quoteVersion: number;
  submittedAt: string;
  startedAt: string | null;
  approvalRequestedAt: string | null;
  customerRespondedAt: string | null;
  readyAt: string | null;
  convertedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  updatedAt: string;
  items: PreparationItemView[];
  events: PreparationEventView[];
};

export type PreparationMutationResult = {
  preparation: PreparationView;
};

export type VariantSearchResult = {
  variants: PreparationVariantReference[];
};
