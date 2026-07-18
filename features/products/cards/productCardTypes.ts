import type {
  ProductType,
  ProductVariantType
} from '@/types/types';

export type ProductCardActions = {
  /**
   * Opens the quick modal without altering
   * the active Feed Experience.
   */
  onPreview?: (
    product: ProductType
  ) => void;

  /**
   * Opens the assembled product experience
   * inside the central Feed.
   */
  onOpenExperience?: (
    product: ProductType
  ) => void;

  /**
   * Kept temporarily for older card consumers.
   * New premium cards use WishlistProvider directly.
   */
  onToggleLike?: (
    productId: string
  ) => void;

  onAddToCart?: (
    product: ProductType,
    variant: ProductVariantType
  ) => void;
};

export type BaseProductCardProps =
  ProductCardActions & {
    product: ProductType;
    className?: string;
  };