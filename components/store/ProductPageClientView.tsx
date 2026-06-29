'use client';

import { useProductPage } from '@/hooks/useProductPage';
import { ProductType } from '@/types';
import ProductHeroSection from '@/components/store/product/ProductHeroSection';
import SingleProductGalleryView from '@/components/store/product/SingleProductGalleryView';
import ProductDetailsPanel from '@/components/store/product/ProductDetailsPanel';
import SingleProductAside from '@/components/store/product/SingleProductAside';

export default function ProductPageClientView({ product }: { product: ProductType }) {
  const { selectedVariant, ...actions } = useProductPage(product);

  return (
    <div className="min-h-screen bg-background">
      {/* 1. Global Hero Stage */}
      <ProductHeroSection product={product} activeVariant={selectedVariant} />

      {/* 2. Main Layout Grid (Mimics the Store layout) */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* LEFT COLUMN: Main content (Gallery + Narrative + Specs) */}
          <div className="lg:col-span-8 space-y-12">
            <SingleProductGalleryView
              product={product}
              selectedVariantId={actions.selectedVariantId}
              setSelectedVariantId={actions.setSelectedVariantId}
            />

            {/* The Product Narrative Block (Matches image_5f8f1d.jpg) */}
            <ProductDetailsPanel product={product} />
          </div>

          {/* RIGHT COLUMN: Fixed Conversion Panel (Aside + Discover More) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-8">
              {/* Conversion Engine (The "Get" button box from screenshots) */}
              <SingleProductAside product={product} {...actions} />

              {/* "Discover more" Section (Matching image_5f8f1d.jpg layout) */}
              <div className="premium-card p-6 rounded-3xl border border-border bg-card/50">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">
                  Discover more
                </h3>
                <div className="space-y-4">
                  {/* This is where your recommended products/Discovery items go */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
