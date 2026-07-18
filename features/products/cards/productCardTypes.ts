import type {
  ProductType,
  ProductVariantType
} from '@/types/types';

export type ProductCardActions = {
  onPreview?: (product: ProductType) => void;

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