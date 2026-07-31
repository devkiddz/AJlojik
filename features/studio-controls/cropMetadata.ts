import type {
  StudioCropPurpose,
  StudioCropRecipe,
  StudioCropRecipeMap
} from './studioTypes';

type JsonRecord = Record<string, unknown>;

function record(value: unknown): JsonRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function fraction(value: number): string {
  return (clamp(value, 0, 100) / 100)
    .toFixed(6)
    .replace(/0+$/, '')
    .replace(/\.$/, '');
}

function normalizedRotation(value: number): number {
  const rounded = Math.round(clamp(value, -180, 180) * 100) / 100;
  return Object.is(rounded, -0) ? 0 : rounded;
}

export function readStudioCropRecipes(metadata: unknown): StudioCropRecipeMap {
  const root = record(metadata);
  const crops = record(root?.studioCrops);

  if (!crops) return {};

  const result: StudioCropRecipeMap = {};

  for (const [purpose, value] of Object.entries(crops)) {
    const recipe = record(value);

    if (
      !recipe ||
      typeof recipe.aspect !== 'number' ||
      typeof recipe.zoom !== 'number' ||
      typeof recipe.rotation !== 'number'
    ) {
      continue;
    }

    result[purpose as StudioCropPurpose] =
      recipe as unknown as StudioCropRecipe;
  }

  return result;
}

export function readStudioCropRecipe(
  metadata: unknown,
  purpose: StudioCropPurpose
): StudioCropRecipe | null {
  return readStudioCropRecipes(metadata)[purpose] ?? null;
}

export function mergeStudioCropRecipeMetadata(
  metadata: unknown,
  recipe: StudioCropRecipe
): Record<string, unknown> {
  const root = record(metadata) ?? {};
  const crops = record(root.studioCrops) ?? {};

  return {
    ...root,
    studioCrops: {
      ...crops,
      [recipe.purpose]: recipe
    }
  };
}

export function cropObjectPosition(
  recipe: StudioCropRecipe | null | undefined
): string | undefined {
  if (!recipe) return undefined;

  const area = recipe.areaPercentages;
  const x = clamp(area.x + area.width / 2, 0, 100);
  const y = clamp(area.y + area.height / 2, 0, 100);

  return `${x.toFixed(2)}% ${y.toFixed(2)}%`;
}

/**
 * Generates a non-destructive Cloudinary delivery URL from the crop recipe.
 * The source asset remains unchanged; Cloudinary creates and caches the derived
 * rendition when the URL is requested. Non-Cloudinary URLs are returned intact.
 */
export function cloudinaryCroppedImageUrl(
  sourceUrl: string,
  recipe: StudioCropRecipe | null | undefined
): string {
  if (!recipe) return sourceUrl;

  let url: URL;

  try {
    url = new URL(sourceUrl);
  } catch {
    return sourceUrl;
  }

  if (
    url.protocol !== 'https:' ||
    url.hostname !== 'res.cloudinary.com' ||
    !url.pathname.includes('/image/upload/')
  ) {
    return sourceUrl;
  }

  const marker = '/image/upload/';
  const markerIndex = url.pathname.indexOf(marker);

  if (markerIndex < 0) return sourceUrl;

  const beforeUpload = url.pathname.slice(0, markerIndex + marker.length);
  const afterUpload = url.pathname.slice(markerIndex + marker.length);
  const transforms: string[] = [];
  const rotation = normalizedRotation(recipe.rotation);

  if (rotation !== 0) {
    transforms.push(`a_${rotation}`);
  }

  const area = recipe.areaPercentages;
  const fullFrame =
    area.x <= 0.001 &&
    area.y <= 0.001 &&
    area.width >= 99.999 &&
    area.height >= 99.999;

  if (!fullFrame) {
    const width = Math.max(0.000001, clamp(area.width, 0, 100));
    const height = Math.max(0.000001, clamp(area.height, 0, 100));
    const x = clamp(area.x, 0, Math.max(0, 100 - width));
    const y = clamp(area.y, 0, Math.max(0, 100 - height));

    transforms.push(
      [
        'c_crop',
        `x_${fraction(x)}`,
        `y_${fraction(y)}`,
        `w_${fraction(width)}`,
        `h_${fraction(height)}`
      ].join(',')
    );
  }

  if (transforms.length === 0) return sourceUrl;

  url.pathname = `${beforeUpload}${transforms.join('/')}/${afterUpload}`;
  return url.toString();
}

export function resolveStudioCroppedMedia(
  sourceUrl: string,
  metadata: unknown,
  purpose: StudioCropPurpose
): {
  url: string;
  objectPosition?: string;
} {
  const recipe = readStudioCropRecipe(metadata, purpose);
  const transformedUrl = cloudinaryCroppedImageUrl(sourceUrl, recipe);

  return {
    url: transformedUrl,
    objectPosition:
      transformedUrl === sourceUrl
        ? cropObjectPosition(recipe)
        : '50% 50%'
  };
}

export function cropMediaStyle(
  recipe: StudioCropRecipe | null | undefined
): {
  objectPosition?: string;
} {
  return {
    objectPosition: cropObjectPosition(recipe)
  };
}

export const studioCropPurposeOptions: ReadonlyArray<{
  value: StudioCropPurpose;
  label: string;
  aspect: number;
}> = [
  { value: 'product-square', label: 'Product square · 1:1', aspect: 1 },
  { value: 'product-gallery', label: 'Product gallery · 4:5', aspect: 4 / 5 },
  { value: 'category-cover', label: 'Category cover · 16:9', aspect: 16 / 9 },
  { value: 'brand-cover', label: 'Brand cover · 16:9', aspect: 16 / 9 },
  { value: 'collection-cover', label: 'Collection cover · panoramic 9:2 · 1800×400', aspect: 9 / 2 },
  { value: 'promotion-banner', label: 'Promotion banner · 16:9', aspect: 16 / 9 },
  { value: 'hero-desktop', label: 'Hero desktop · 21:9', aspect: 21 / 9 },
  { value: 'hero-mobile', label: 'Hero mobile · 4:5', aspect: 4 / 5 },
  { value: 'banner-desktop', label: 'Store banner desktop · 21:9', aspect: 21 / 9 },
  { value: 'banner-mobile', label: 'Store banner mobile · 4:5', aspect: 4 / 5 },
  { value: 'story', label: 'Commerce Story · 9:16', aspect: 9 / 16 },
  { value: 'reel-cover', label: 'Reel cover · 9:16', aspect: 9 / 16 },
  { value: 'video-poster', label: 'Video poster · 9:16', aspect: 9 / 16 }
];
