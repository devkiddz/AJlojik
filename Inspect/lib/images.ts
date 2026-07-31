export function resolveExperienceMedia(
  src?: string | null,
  fallback = '/placeholders/product.jpg'
) {
  return src?.trim() ? src : fallback;
}