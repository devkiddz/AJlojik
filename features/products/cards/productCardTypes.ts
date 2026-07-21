import type {
  ProductType,
  ProductVariantType
} from '@/types/types';

export type ProductCardActions = {
  /**
   * Canonical product-card action.
   *
   * Every product entry surface opens the assembled Product
   * Experience inside the central Feed.
   */
  onOpenExperience?: (
    product: ProductType
  ) => void;

  /**
   * Temporary compatibility alias for older Feed modules.
   *
   * Cards no longer render a quick-preview action. When an
   * older caller supplies only onPreview, it is treated as the
   * Product Experience opening action.
   */
  onPreview?: (
    product: ProductType
  ) => void;

  /**
   * Temporary compatibility field for older card consumers.
   *
   * Current premium cards read WishlistProvider directly.
   */
  onToggleLike?: (
    productId: string
  ) => void | Promise<void>;

  /**
   * Optional compatibility adapter for callers that already
   * route add-to-cart actions through FeedActions.
   *
   * Product-card quantity changes still resolve from CartProvider.
   */
  onAddToCart?: (
    product: ProductType,
    variant: ProductVariantType
  ) => void | Promise<void>;
};

export type BaseProductCardProps =
  ProductCardActions & {
    product: ProductType;
    className?: string;

    locale?: string;
    currency?: string;
  };
