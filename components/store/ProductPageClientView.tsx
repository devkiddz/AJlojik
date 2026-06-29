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
    <div className="min-h-screen bg-background text-foreground">
      <ProductHeroSection product={product} activeVariant={selectedVariant} />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content: 8 Columns */}
          <div className="lg:col-span-8 space-y-12">
            <SingleProductGalleryView
              product={product}
              selectedVariantId={actions.selectedVariantId}
              setSelectedVariantId={actions.setSelectedVariantId}
            />
            <ProductDetailsPanel product={product} />
          </div>

          {/* Right Sidebar: 4 Columns */}
          <aside className="lg:col-span-4">
            <SingleProductAside product={product} {...actions} />
          </aside>
        </div>
      </main>
    </div>
  );
}
