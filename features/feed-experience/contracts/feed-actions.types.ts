import type { ProductType, ProductVariantType } from "@/types/types";

export type ExperienceTarget =
  | { type: "home" }
  | { type: "store-discovery"; categorySlug?: string }
  | { type: "category"; categorySlug: string }
  | { type: "product"; productId: string }
  | { type: "collection"; collectionId: string }
  | { type: "promotion"; promotionId: string }
  | { type: "search"; query: string };

export type FeedActions = {
  openExperience: (target: ExperienceTarget) => void;
  resetExperience: () => void;
  changeCategory: (updates: Record<string, string | null>) => void;
  previewProduct: (product: ProductType) => void;
  toggleLike: (productId: string) => void;
  addToCart: (product: ProductType, variant: ProductVariantType) => void;
  previewPromotion?: (promoId: string) => void;
};
