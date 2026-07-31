import 'server-only';

import type { Prisma } from '@/lib/generated/prisma/client';

import type { StudioCropPurpose, StudioCropRecipe } from '../studioTypes';

const CROP_PURPOSES = new Set<StudioCropPurpose>([
  'product-square',
  'product-gallery',
  'category-cover',
  'brand-cover',
  'collection-cover',
  'promotion-banner',
  'hero-desktop',
  'hero-mobile',
  'banner-desktop',
  'banner-mobile',
  'story',
  'reel-cover',
  'video-poster'
]);

type JsonRecord = Record<string, unknown>;

export function jsonRecord(value: unknown): JsonRecord {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};
}

function validNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function parseStudioCropRecipe(value: unknown): StudioCropRecipe | null {
  const recipe = jsonRecord(value);
  const crop = jsonRecord(recipe.crop);
  const percentages = jsonRecord(recipe.areaPercentages);
  const pixels = jsonRecord(recipe.areaPixels);
  const purpose = recipe.purpose;

  if (
    typeof purpose !== 'string' ||
    !CROP_PURPOSES.has(purpose as StudioCropPurpose) ||
    !validNumber(recipe.aspect) ||
    !validNumber(recipe.zoom) ||
    !validNumber(recipe.rotation) ||
    !validNumber(crop.x) ||
    !validNumber(crop.y) ||
    !validNumber(percentages.x) ||
    !validNumber(percentages.y) ||
    !validNumber(percentages.width) ||
    !validNumber(percentages.height) ||
    !validNumber(pixels.x) ||
    !validNumber(pixels.y) ||
    !validNumber(pixels.width) ||
    !validNumber(pixels.height)
  ) return null;

  return {
    purpose: purpose as StudioCropPurpose,
    aspect: recipe.aspect,
    zoom: Math.min(3, Math.max(1, recipe.zoom)),
    rotation: Math.min(180, Math.max(-180, recipe.rotation)),
    crop: { x: crop.x, y: crop.y },
    areaPercentages: {
      x: Math.min(100, Math.max(0, percentages.x)),
      y: Math.min(100, Math.max(0, percentages.y)),
      width: Math.min(100, Math.max(0, percentages.width)),
      height: Math.min(100, Math.max(0, percentages.height))
    },
    areaPixels: {
      x: Math.max(0, pixels.x),
      y: Math.max(0, pixels.y),
      width: Math.max(1, pixels.width),
      height: Math.max(1, pixels.height)
    },
    updatedAt: typeof recipe.updatedAt === 'string' ? recipe.updatedAt : new Date().toISOString()
  };
}

export function mergeStudioCropRecipe(
  metadata: unknown,
  recipe: StudioCropRecipe
): Prisma.InputJsonObject {
  const current = jsonRecord(metadata);
  const crops = jsonRecord(current.studioCrops);
  return JSON.parse(
    JSON.stringify({
      ...current,
      studioCrops: { ...crops, [recipe.purpose]: recipe }
    })
  ) as Prisma.InputJsonObject;
}
