'use client';

import { ProductType } from '@/types';

import ProductActions from './product/ProductActions';
import SingleProductGalleryView from './product/SingleProductGalleryView';

type Props = {
  product: ProductType;
};

export default function ProductPageClientView({ product }: Props) {
  return (
    <section className="w-full py-16 space-y-10 relative -top-100">
      <SingleProductGalleryView product={product} />
      <ProductActions product={product} />

      <section>
        <h2 className="mb-6 text-3xl font-bold">Related Products</h2>

        <div className="rounded-3xl border border-dashed p-12 text-center text-muted-foreground">
          Related Products Coming Soon
        </div>
      </section>
    </section>
  );
}
