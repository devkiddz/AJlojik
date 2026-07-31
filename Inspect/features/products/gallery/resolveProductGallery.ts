import type { ProductType } from '@/types/types';

export type ProductGalleryImage = {
  id: string;
  src: string;
  alt: string;
  label?: string;
  source:
    | 'variant'
    | 'product'
    | 'category'
    | 'review';
};

type ProductWithGallery = ProductType & {
  gallery?: string[];
  images?: string[];
};

type ResolveProductGalleryInput = {
  product: ProductType;
  categoryCoverImage?: string;
};

function normalizeImageSource(
  source: unknown
): string | null {
  if (typeof source !== 'string') {
    return null;
  }

  const normalized =
    source.trim();

  return normalized || null;
}

export function resolveProductGallery({
  product,
  categoryCoverImage
}: ResolveProductGalleryInput): ProductGalleryImage[] {
  const productWithGallery =
    product as ProductWithGallery;

  const images: ProductGalleryImage[] = [];

  product.variants.forEach(
    variant => {
      const source =
        normalizeImageSource(
          variant.image
        );

      if (!source) {
        return;
      }

      images.push({
        id: `variant:${variant.id}`,
        src: source,
        alt: `${product.name} — ${variant.label}`,
        label: variant.label,
        source: 'variant'
      });
    }
  );

  productWithGallery.gallery?.forEach(
    (
      image,
      index
    ) => {
      const source =
        normalizeImageSource(
          image
        );

      if (!source) {
        return;
      }

      images.push({
        id: `gallery:${index}`,
        src: source,
        alt: `${product.name} gallery image ${index + 1}`,
        source: 'product'
      });
    }
  );

  productWithGallery.images?.forEach(
    (
      image,
      index
    ) => {
      const source =
        normalizeImageSource(
          image
        );

      if (!source) {
        return;
      }

      images.push({
        id: `product-image:${index}`,
        src: source,
        alt: `${product.name} image ${index + 1}`,
        source: 'product'
      });
    }
  );

  const normalizedCategoryCover =
    normalizeImageSource(
      categoryCoverImage
    );

  if (normalizedCategoryCover) {
    images.push({
      id: 'category-cover',
      src: normalizedCategoryCover,
      alt: `${product.name} category presentation`,
      label: 'Experience',
      source: 'category'
    });
  }

  const uniqueImages =
    new Map<
      string,
      ProductGalleryImage
    >();

  images.forEach(image => {
    if (
      !uniqueImages.has(
        image.src
      )
    ) {
      uniqueImages.set(
        image.src,
        image
      );
    }
  });

  return [
    ...uniqueImages.values()
  ];
}