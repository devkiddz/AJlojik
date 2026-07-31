'use client';

import { StudioPreviewDialog } from '@/features/studio-controls';

type PreviewProduct = {
  name: string;
  shortDescription: string | null;
  status:
    | 'DRAFT'
    | 'PENDING_REVIEW'
    | 'PUBLISHED'
    | 'PAUSED'
    | 'REJECTED'
    | 'ARCHIVED';
  mediaAssetIds: string[];
  variants: Array<{
    price: number;
  }>;
} | null;

type PreviewMedia = Array<{
  id: string;
  secureUrl: string;
}>;

export function ProductSavedPreview({
  product,
  media
}: {
  product: PreviewProduct;
  media: PreviewMedia;
}) {
  const image = media.find(asset => product?.mediaAssetIds.includes(asset.id));
  const variant = product?.variants[0];

  return (
    <StudioPreviewDialog
      title={product ? `${product.name} preview` : 'New product preview'}
      description="Preview the last saved Product Studio state across customer device widths. Save draft changes before using this preview."
      triggerLabel="Preview product"
      className="w-full"
    >
      {device => (
        <div className="min-h-[32rem] bg-muted/30 p-4 sm:p-6">
          <article
            className={`mx-auto overflow-hidden rounded-[2rem] border bg-card shadow-xl ${
              device === 'mobile' ? 'max-w-sm' : 'max-w-3xl'
            }`}
          >
            <div className={device === 'mobile' ? 'grid' : 'grid md:grid-cols-2'}>
              <div className="relative aspect-square bg-muted">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image.secureUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : null}
              </div>

              <div className="flex flex-col justify-center p-6">
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-primary">
                  {product?.status.replaceAll('_', ' ') ?? 'Unsaved product'}
                </p>
                <h2 className="mt-3 text-2xl font-black">
                  {product?.name ?? 'Product name'}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {product?.shortDescription ??
                    'Save the product identity to preview its customer presentation.'}
                </p>
                <p className="mt-5 text-xl font-black">
                  {variant
                    ? new Intl.NumberFormat('en-NG', {
                        style: 'currency',
                        currency: 'NGN'
                      }).format(variant.price)
                    : 'Price pending'}
                </p>
                <span className="mt-5 inline-flex w-fit rounded-full bg-foreground px-4 py-2 text-xs font-black text-background">
                  Add to Cart
                </span>
              </div>
            </div>
          </article>
        </div>
      )}
    </StudioPreviewDialog>
  );
}
