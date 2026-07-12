import Link from 'next/link';

import ProductCard from '@/components/store/StoreProductCard';

import { ProductType } from '@/types/types';

type Props = {
  product: ProductType;
  products: ProductType[];
};

export default function RelatedProductsSection({ product, products }: Props) {
  const relatedProducts = products
    .filter(item => item.category === product.category && item.id !== product.id)
    .slice(0, 4);

  if (!relatedProducts.length) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">You Might Also Like</h2>

        <Link href={`/store/${product.category}`} className="text-sm font-medium">
          View All
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {relatedProducts.map(item => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </section>
  );
}
