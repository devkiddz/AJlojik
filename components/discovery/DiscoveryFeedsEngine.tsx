'use client';

import StoreCategoryCard from '../store/StoreCategoryCard';
import StoreFeaturedProductCard from '../store/StoreFeaturedProductCard';
import StoreFeaturedProductsSlide from '../store/StoreFeaturedProductsSlide';
import StoreProductGridCard from '../store/product/StoreProductGridCard';

import { CollectionType } from '@/data/collections';
import { CategoriesType, ProductType, ProductVariantType } from '@/types';
import CollectionSection from '@/components/collections/CollectionSection';

type Props = {
  triggerRef: React.RefObject<HTMLDivElement | null>;

  categories: CategoriesType;
  collections: {
    collection: CollectionType;
    products: ProductType[];
    featuredProduct?: ProductType;
  }[];

  selectedCategory: string;

  featuredProduct?: ProductType;
  featuredProducts: ProductType[];
  filteredProducts: ProductType[];

  onCategoryChange: (updates: Record<string, string | null>) => void;

  onPreview: (product: ProductType) => void;
  onToggleLike: (productId: string) => void;
  onAddToCart: (product: ProductType, variant: ProductVariantType) => void;
};

export default function DiscoveryFeedsEngine({
  triggerRef,
  categories,
  collections,
  selectedCategory,
  featuredProduct,
  featuredProducts,
  filteredProducts,
  onCategoryChange,
  onPreview,
  onToggleLike,
  onAddToCart
}: Props) {
  return (
    <main className="relative col-span-12 lg:col-span-10">
      <div className="space-y-8">
        {/* Categories */}
        <section ref={triggerRef}>
          <div className="grid grid-cols-2 gap-2 pt-2 md:grid-cols-3 xl:grid-cols-3">
            {categories.map(category => (
              <StoreCategoryCard
                key={category.id}
                category={category}
                active={selectedCategory === category.slug}
                onClick={() =>
                  onCategoryChange({
                    category: category.slug
                  })
                }
              />
            ))}
          </div>
        </section>

        {/* Featured */}
        <section>
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-4">
              {featuredProduct && (
                <StoreFeaturedProductCard
                  product={featuredProduct}
                  onPreview={onPreview}
                  onToggleLike={onToggleLike}
                  onAddToCart={onAddToCart}
                />
              )}
            </div>

            <div className="col-span-12 min-w-0 lg:col-span-8">
              <StoreFeaturedProductsSlide
                products={featuredProducts}
                onPreview={onPreview}
                onAddToCart={onAddToCart}
                onLike={product => onToggleLike(product.id)}
              />
            </div>
          </div>
        </section>

        {/* Products */}
        <section
          className="
          grid
          gap-5
          p-4
          grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4
          xl:grid-cols-5
          2xl:grid-cols-6
          3xl:grid-cols-7
          bg-background
          rounded-xl
          shadow-md
        ">
          {filteredProducts.map(product => (
            <StoreProductGridCard
              key={product.id}
              product={product}
              onPreview={onPreview}
              onToggleLike={onToggleLike}
              onAddToCart={onAddToCart}
            />
          ))}
        </section>

        {/* Collections */}
        <section className="space-y-10 pt-6">
          {collections.map(({ collection, products, featuredProduct }) => (
            <CollectionSection
              key={collection.id}
              collection={collection}
              products={products}
              featuredProduct={featuredProduct}
              onSelect={id => {
                const product = filteredProducts.find(p => p.id === id);
                if (product) onPreview(product);
              }}
              onToggleLike={onToggleLike}
            />
          ))}
        </section>
      </div>
    </main>
  );
}
