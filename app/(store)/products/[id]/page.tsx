import ProductHeroSection from '@/components/store/product/ProductHeroSection';
import ProductPageClientView from '@/components/store/ProductPageClientView';

import { products } from '@/data/products';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductPage({ params }: Props) {
  const { id } = await params;

  const product = products.find(p => p.id.trim() === id.trim() || p.slug.trim() === id.trim());

  if (!product) {
    return <div className="mx-auto max-w-7xl py-24 text-center">Product not found</div>;
  }

  return (
    <main className="flex flex-col gap-10">
      <div className="max-h-100">
        <ProductHeroSection product={product} />
      </div>

      <div>
        <ProductPageClientView product={product} />
      </div>
    </main>
  );
}
