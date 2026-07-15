import type { ProductType, ProductVariantType } from '@/types/types';
import { FeedIntent } from './feed-intent.types';

export type ExperienceTarget =
  | { type: 'home' }
  | { type: 'store-discovery'; categorySlug?: string }
  | { type: 'category'; categorySlug: string }
  | { type: 'product'; productId: string }
  | { type: 'collection'; collectionId: string }
  | { type: 'promotion'; promotionId: string }
  | { type: 'search'; query: string };

export type FeedActions = {
  openExperience: (target: ExperienceTarget) => void;

  restoreExperience: (intent: FeedIntent) => void;

  resetExperience: () => void;

  changeCategory: (
    updates: Record<string, string | null>
  ) => void;

  previewProduct: (product: ProductType) => void;

  toggleLike: (productId: string) => void;

  addToCart: (
    product: ProductType,
    variant: ProductVariantType
  ) => void;

  previewPromotion?: (promoId: string) => void;
};