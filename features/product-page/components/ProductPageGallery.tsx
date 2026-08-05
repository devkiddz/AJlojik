'use client';

/* AJ_PRODUCT_PAGE_GALLERY_VARIANT_DRIVEN_V1 */
/* AJ_PRODUCT_PAGE_V2A2_PREVIEWER_ONLY */

import {
  useEffect,
  useMemo,
  useState
} from 'react';

import Image from 'next/image';

import {
  ChevronLeft,
  ChevronRight,
  Expand,
  Images
} from 'lucide-react';

import {
  ProductGalleryDialog,
  resolveProductGallery
} from '@/features/products/gallery';

import type {
  ProductType
} from '@/types/types';

import styles from './ProductPageExperience.module.css';

type ProductPageGalleryProps = {
  product: ProductType;
  selectedVariantId?: string;
};

export function ProductPageGallery({
  product,
  selectedVariantId
}: ProductPageGalleryProps) {
  const images =
    useMemo(
      () =>
        resolveProductGallery({
          product
        }),
      [
        product
      ]
    );

  const preferredImageId =
    selectedVariantId
      ? `variant:${selectedVariantId}`
      : images[0]?.id;

  const [
    activeImageId,
    setActiveImageId
  ] = useState<
    string |
    undefined
  >(
    preferredImageId
  );

  const [
    galleryOpen,
    setGalleryOpen
  ] = useState(
    false
  );

  useEffect(() => {
    if (
      preferredImageId &&
      images.some(
        image =>
          image.id ===
          preferredImageId
      )
    ) {
      setActiveImageId(
        preferredImageId
      );
    }
  }, [
    images,
    preferredImageId
  ]);

  const activeIndex =
    Math.max(
      0,
      images.findIndex(
        image =>
          image.id ===
          activeImageId
      )
    );

  const activeImage =
    images[
      activeIndex
    ] ??
    images[0];

  const showPrevious =
    (): void => {
      if (
        images.length <=
        1
      ) {
        return;
      }

      const nextIndex =
        (
          activeIndex -
          1 +
          images.length
        ) %
        images.length;

      setActiveImageId(
        images[nextIndex]?.id
      );
    };

  const showNext =
    (): void => {
      if (
        images.length <=
        1
      ) {
        return;
      }

      const nextIndex =
        (
          activeIndex +
          1
        ) %
        images.length;

      setActiveImageId(
        images[nextIndex]?.id
      );
    };

  if (!activeImage) {
    return (
      <section className="grid min-h-80 place-items-center text-sm text-white/65">
        Product artwork unavailable
      </section>
    );
  }

  return (
    <>
      <section
        aria-label={`${product.name} gallery`}
        className={
          styles.gallery
        }>
        <div
          className={
            styles.galleryStage
          }>
          <Image
            src={
              activeImage.src
            }
            alt=""
            fill
            priority
            sizes="(max-width: 832px) 100vw, (max-width: 1440px) 44vw, 40vw"
            className={
              styles.galleryBackdrop
            }
          />

          <button
            type="button"
            aria-label={`Open gallery for ${product.name}`}
            onClick={() =>
              setGalleryOpen(
                true
              )
            }
            className={
              styles.galleryOpenArea
            }>
            <span
              className={
                styles.galleryImageFrame
              }>
              <Image
                key={
                  activeImage.id
                }
                src={
                  activeImage.src
                }
                alt={
                  activeImage.alt
                }
                fill
                priority
                quality={
                  95
                }
                sizes="(max-width: 832px) 92vw, (max-width: 1440px) 42vw, 38vw"
                className={
                  styles.galleryProductImage
                }
              />
            </span>
          </button>

          <span
            className={
              styles.galleryOverlay
            }
          />

          <div
            className={
              styles.galleryTopRow
            }>
            <span
              className={
                styles.galleryBadge
              }>
              <Images className="size-3.5" />

              {activeIndex + 1}
              {' / '}
              {images.length}
            </span>

            <button
              type="button"
              aria-label={`Expand ${product.name} gallery`}
              onClick={() =>
                setGalleryOpen(
                  true
                )
              }
              className={
                styles.galleryExpand
              }>
              <Expand className="size-4" />
            </button>
          </div>

          {images.length >
          1 ? (
            <div
              className={
                styles.galleryNav
              }>
              <button
                type="button"
                aria-label="Show previous product image"
                onClick={
                  showPrevious
                }
                className={
                  styles.galleryNavButton
                }>
                <ChevronLeft className="size-4" />
              </button>

              <button
                type="button"
                aria-label="Show next product image"
                onClick={
                  showNext
                }
                className={
                  styles.galleryNavButton
                }>
                <ChevronRight className="size-4" />
              </button>
            </div>
          ) : null}

          <div
            className={
              styles.galleryBottomRow
            }>
            <span>
              Selected option artwork
            </span>

            <span>
              Use variants to change the purchasable option
            </span>
          </div>
        </div>
      </section>

      <ProductGalleryDialog
        open={
          galleryOpen
        }
        onOpenChange={
          setGalleryOpen
        }
        productName={
          product.name
        }
        images={
          images
        }
        initialImageId={
          activeImage.id
        }
      />
    </>
  );
}
