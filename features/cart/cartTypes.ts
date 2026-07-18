import type {
  ProductType,
  ProductVariantType
} from '@/types/types';

export type CartItem = {
  id: string;
  productId: string;
  variantId: string;

  product: ProductType;
  variant: ProductVariantType;

  quantity: number;

  createdAt: string;
  updatedAt: string;
};

export type CartState = {
  items: CartItem[];

  itemCount: number;
  totalQuantity: number;
  subtotal: number;

  loading: boolean;
  mutating: boolean;
  error: string | null;
};

export type AddToCartInput = {
  product: ProductType;
  variant: ProductVariantType;
  quantity?: number;
};

export type UpdateCartQuantityInput = {
  itemId: string;
  quantity: number;
};

export type CartRuntime = {
  workspaceId: string | null;
  isGuest: boolean;
};

export type CartContextValue = CartState & {
  refreshCart: () => Promise<void>;

  addToCart: (
    input: AddToCartInput
  ) => Promise<CartItem | null>;

  updateQuantity: (
    input: UpdateCartQuantityInput
  ) => Promise<void>;

  removeFromCart: (
    itemId: string
  ) => Promise<void>;

  clearCart: () => Promise<void>;

  containsVariant: (
    variantId: string
  ) => boolean;

  clearError: () => void;
};

export type CartMutationResponse = {
  items: CartItem[];
  affectedItem?: CartItem | null;
};