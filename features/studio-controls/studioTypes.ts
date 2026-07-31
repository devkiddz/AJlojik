export type StudioCropPurpose =
  | 'product-square'
  | 'product-gallery'
  | 'category-cover'
  | 'brand-cover'
  | 'collection-cover'
  | 'promotion-banner'
  | 'hero-desktop'
  | 'hero-mobile'
  | 'banner-desktop'
  | 'banner-mobile'
  | 'story'
  | 'reel-cover'
  | 'video-poster';

export type StudioCropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type StudioCropRecipe = {
  purpose: StudioCropPurpose;
  aspect: number;
  crop: {
    x: number;
    y: number;
  };
  zoom: number;
  rotation: number;
  areaPercentages: StudioCropArea;
  areaPixels: StudioCropArea;
  updatedAt: string;
};

export type StudioCropRecipeMap = Partial<
  Record<StudioCropPurpose, StudioCropRecipe>
>;

export type StudioProductOption = {
  id: string;
  name: string;
  imageUrl: string | null;
  category: string | null;
  vendor: string | null;
  status: string;
  active: boolean;
  available: number;
  variants: number;
  priceLabel?: string | null;
};

export type StudioDestinationOption = {
  id: string;
  type: 'product' | 'promotion' | 'collection' | 'route';
  label: string;
  description?: string | null;
  imageUrl?: string | null;
  href: string;
  available?: boolean;
};

export type StudioMediaOption = {
  id: string;
  secureUrl: string;
  resourceType: 'IMAGE' | 'VIDEO' | 'RAW' | 'image' | 'video';
  displayName: string | null;
  originalFilename: string | null;
  metadata?: unknown;
};
