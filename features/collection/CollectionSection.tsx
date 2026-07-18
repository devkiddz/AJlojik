import { Button } from '@/components/ui/button';
import type { CollectionType } from '@/data/collections';
import { getCollectionIcon } from '@/lib/collection-icons';
import type { ProductType, ProductVariantType } from '@/types/types';
import CollectionBanner from './CollectionBanner';
import FeaturedCollection from './layouts/FeaturedCollection';
import { ArrowRight, PartyPopper, type LucideIcon } from 'lucide-react';

type CollectionIconProps = {
  // Allow LucideIcon, null, or undefined so it plays nicely with return values
  icon?: LucideIcon | null;
  accent?: string;
};

function CollectionIconDisplay({ icon: Icon = PartyPopper, accent }: CollectionIconProps) {
  // If the passed icon is null, default back to PartyPopper
  const ActiveIcon = Icon ?? PartyPopper;

  return (
    <ActiveIcon
      className="size-5 md:size-6"
      style={{
        color: accent ?? '#64748b'
      }}
    />
  );
}

type CollectionSectionProps = {
  collection: CollectionType;
  products: ProductType[];
  featuredProduct?: ProductType;
  onPreview?: (product: ProductType) => void;
  onToggleLike?: (productId: string) => void;
  onAddToCart?: (product: ProductType, variant: ProductVariantType) => void;
};

export default function CollectionSection({
  collection,
  products,
  featuredProduct,
  onPreview,
  onToggleLike,
  onAddToCart
}: CollectionSectionProps) {
  if (!collection.active || !products.length || !featuredProduct) {
    return null;
  }

  const collectionIcon = getCollectionIcon(collection.icon?.value);
  const supportingProducts = products.filter(product => product.id !== featuredProduct.id);
  const displayProducts = supportingProducts.length > 0 ? supportingProducts : products;

  return (
    <section className="relative max-w-full overflow-hidden rounded-3xl border border-border/60 bg-card shadow-lg">
      <div className="relative overflow-hidden">
        {collection.banner?.image ? (
          <CollectionBanner
            banner={collection.banner}
            title={collection.title}
            count={displayProducts.length}
          />
        ) : (
          <header className="flex items-center justify-between gap-4 px-4 py-4 md:px-6 md:py-5">
            <div className="flex min-w-0 items-center gap-3 md:gap-4">
              <div
                className="grid size-10 shrink-0 place-items-center rounded-xl md:size-12"
                style={{
                  backgroundColor: `${collection.theme?.accent ?? '#64748b'}20`
                }}>
                <CollectionIconDisplay icon={collectionIcon} accent={collection.theme?.accent} />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-sm font-bold tracking-tight md:text-lg">{collection.title}</h2>

                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.68rem] font-bold text-primary">
                    {displayProducts.length}
                  </span>
                </div>

                {collection.subtitle ? (
                  <p className="mt-1 hidden max-w-2xl text-sm text-muted-foreground md:block">
                    {collection.subtitle}
                  </p>
                ) : null}
              </div>
            </div>

            <Button type="button" variant="outline" className="shrink-0 gap-2 rounded-full">
              <span className="hidden sm:inline">View collection</span>
              <ArrowRight className="size-4" />
            </Button>
          </header>
        )}
      </div>

      <div className="p-3 md:p-5 lg:p-6">
        <FeaturedCollection
          collection={collection}
          products={products}
          featuredProduct={featuredProduct}
          onPreview={onPreview}
          onToggleLike={onToggleLike}
          onAddToCart={onAddToCart}
        />
      </div>
    </section>
  );
}
