import { CollectionType } from '@/data/collections';
import { ProductType } from '@/types';
import { getCollectionIcon } from '@/lib/collection-icons';

import CollectionBanner from './CollectionBanner';
import FeaturedCollection from './layouts/FeaturedCollection';
import { Button } from '../ui/button';
import { ArrowRight, PartyPopper } from 'lucide-react';
type Props = {
  collection: CollectionType;
  products: ProductType[];
  featuredProduct?: ProductType;
  onSelect?: (id: string) => void;
  onToggleLike?: (id: string) => void;
};

export default function CollectionSection({
  collection,
  products,
  featuredProduct,
  onSelect,
  onToggleLike
}: Props) {
  if (!collection.active || products.length === 0) {
    return null;
  }

  if (!featuredProduct) return null;
  const carouselProducts = products.filter(product => product.id !== featuredProduct.id);
  const displayProducts = carouselProducts.length > 0 ? carouselProducts : products;
  const Icon = getCollectionIcon(collection.icon?.value);

  return (
    <section className="relative max-w-full rounded-3xl bg-card">
      <div className="relative overflow-hidden rounded-2xl">
        {collection.banner?.image ? (
          <CollectionBanner
            banner={collection.banner}
            title={collection.title}
            count={displayProducts.length}
          />
        ) : (
          <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-card px-4 py-5 md:px-6">
            {/* Left */}
            <div className="flex items-center md:items-start gap-4">
              <div
                className="flex h-6 w-6 lg:h-12 lg:w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${collection.theme?.accent}20` }}>
                <Icon className="h-4 w-4 lg:h-6 lg:w-6" color={collection.theme?.accent} />
              </div>

              <div className="flex flex-col gap-1 items-start justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold tracking-tight lg:text-lg">{collection.title}</h2>

                  <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive">
                    {displayProducts.length}
                  </span>
                </div>

                {collection.subtitle && (
                  <p className="hidden lg:inline-block max-w-2xl text-sm text-muted-foreground">
                    {collection.subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Right */}
            <Button variant="outline" className="gap-2 rounded-full text-xs lg:text-sm cursor-pointer">
              View Collection
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="p-4 md:p-6 lg:p-8">
        <FeaturedCollection
          collection={collection}
          products={products}
          featuredProduct={featuredProduct}
          onSelect={onSelect}
          onToggleLike={onToggleLike}
        />
      </div>
    </section>
  );
}
