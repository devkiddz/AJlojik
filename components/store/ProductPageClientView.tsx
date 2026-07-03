'use client';

import { ProductType } from '@/types';
import { useProductPage } from '@/hooks/useProductPage';

import ProductHeroSection from '@/components/store/product/ProductHeroSection';
import SingleProductGalleryView from '@/components/store/product/SingleProductGalleryView';
import ProductDetailsPanel from '@/components/store/product/ProductDetailsPanel';
import SingleProductAside from '@/components/store/product/SingleProductAside';

export default function ProductPageClientView({ product }: { product: ProductType }) {
  const { selectedVariant, ...actions } = useProductPage(product);

  return (
    <div className="min-h-screen bg-background">
      <ProductHeroSection product={product} activeVariant={selectedVariant} />

      <main className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          <section className="space-y-10 lg:col-span-8">
            <SingleProductGalleryView
              product={product}
              selectedVariantId={actions.selectedVariantId}
              setSelectedVariantId={actions.setSelectedVariantId}
            />

            <ProductDetailsPanel product={product} />
          </section>

          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-8">
              <SingleProductAside product={product} {...actions} />

              <section className="premium-card rounded-3xl border border-border bg-card/50 p-6">
                <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Discover more
                </h3>

                <div className="space-y-4">{/* Recommended products later */}</div>
              </section>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
