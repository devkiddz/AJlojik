'use client';

import { ProductType } from '@/types';

import { useSingleProduct } from '@/hooks/useSingleProduct';

import {
  SingleProductHero,
  SingleProductGallery,
  SingleProductOverview,
  SingleProductSpecifications,
  SingleProductStory,
  SingleProductSidebar,
  SingleProductRecommendations
} from '@/components/singleProduct';

type Props = {
  product: ProductType;
};

export default function SingleProductLayout({ product }: Props) {
  const { selectedVariant, selectedVariantId, setSelectedVariantId, inStock } = useSingleProduct(product);

  return (
    <main className="min-h-screen bg-background md:mt-20 md:px-6 overflow-y-auto scrollbar-none">
      <SingleProductHero product={product} variant={selectedVariant} />

      <section className="md:mx-auto md:max-w-[90%] md:px-4 md:py-10 lg:px-2">
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-12">
          {/* INCREASED TO 4 COLUMNS: 
              Giving the Gallery more space allows the images 
              and the variant selection buttons to breathe.
            */}
          <div className="space-y-4 md:space-y-10 lg:col-span-3 md:sticky top-20 md:self-start">
            <SingleProductGallery
              product={product}
              selectedVariantId={selectedVariantId}
              setSelectedVariantId={setSelectedVariantId}
            />
          </div>

          {/* DECREASED TO 5 COLUMNS:
            This makes the text content column more readable. 
            Lines of text that are too long (6 columns) are harder to read.
          */}
          <div className="space-y-4 md:space-y-10 lg:col-span-6 z-5 bg-card overflow-hidden rounded-lg">
            <SingleProductOverview
              product={product}
              selectedVariantId={selectedVariantId}
              setSelectedVariantId={setSelectedVariantId}
            />
            <SingleProductSpecifications product={product} />
            <SingleProductStory product={product} />
            <SingleProductRecommendations product={product} />
          </div>

          {/* REMAINING 3 COLUMNS:
    Perfect for the Purchase/Checkout sidebar.
  */}
          <aside className="lg:col-span-3">
            <div className="sticky top-20">
              <SingleProductSidebar product={product} selectedVariant={selectedVariant} inStock={inStock} />
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
