import { products } from '@/data/products';
import { ProductType } from '@/types/types';

type Props = {
  product: ProductType;
};

export default function SingleProductRecommendation({ product }: Props) {
  const recommendations = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <section className="rounded-3xl border bg-card p-8">
      <h2 className="mb-8 text-2xl font-bold">You may also like</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {recommendations.map(item => (
          <div key={item.id} className="rounded-xl border p-4">
            <div className="font-semibold">{item.name}</div>

            <div className="mt-2 text-sm text-muted-foreground">{item.shortDescription}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
