import type {
  ProductType,
  ProductVariantType
} from '@/types/types';

export type ShoppingListVisibility =
  | 'PRIVATE'
  | 'SHARED';

export type ShoppingListStatus =
  | 'ACTIVE'
  | 'ARCHIVED';

export type ShoppingListPromotion = {
  id: string;
  title: string;

  discountPercentage:
    number | null;

  promotionalPrice:
    number | null;

  startsAt: string | null;
  endsAt: string | null;
};

export type ShoppingListItem = {
  id: string;

  productId: string;
  variantId: string | null;

  product: ProductType;

  variant:
    ProductVariantType | null;

  quantity: number;
  position: number;

  note: string | null;

  promotion:
    ShoppingListPromotion | null;

  addedAt: string;
  updatedAt: string;
};

export type ShoppingList = {
  id: string;

  workspaceId: string;
  userId: string;

  name: string;
  description: string | null;

  visibility:
    ShoppingListVisibility;

  status:
    ShoppingListStatus;

  position: number;

  items:
    ShoppingListItem[];

  itemCount: number;
  totalQuantity: number;
  totalValue: number;

  createdAt: string;
  updatedAt: string;
};

export type ShoppingListMutationResponse = {
  lists: ShoppingList[];

  affectedList?:
    ShoppingList | null;

  affectedItem?:
    ShoppingListItem | null;
};

export type CreateShoppingListInput = {
  workspaceId: string;
  name: string;
  description?: string;
};

export type UpdateShoppingListInput = {
  workspaceId: string;
  listId: string;

  name?: string;
  description?: string | null;

  status?:
    ShoppingListStatus;

  visibility?:
    ShoppingListVisibility;
};

export type AddShoppingListItemInput = {
  workspaceId: string;
  listId: string;

  productId: string;
  variantId?: string | null;

  quantity?: number;
  note?: string;
};

export type UpdateShoppingListItemInput = {
  workspaceId: string;
  listId: string;
  itemId: string;

  quantity?: number;
  note?: string | null;
  position?: number;
};