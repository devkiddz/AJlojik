import { ProductType } from '@/types/types';

type Props = {
  product: ProductType;
};

export default function SingleProductSpecifications({ product }: Props) {
  return (
    <section className="rounded-3xl border bg-card p-8">
      <h2 className="mb-6 text-2xl font-bold">Specifications</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <Spec label="Category" value={product.category} />
        <Spec label="Rating" value={`${product.rating}/5`} />
        <Spec label="Reviews" value={product.reviews} />
        <Spec label="Sold" value={product.soldCount} />
        <Spec label="Delivery" value={product.estimatedDelivery} />
        <Spec label="Discount" value={`${product.discountPercentage}%`} />
      </div>
    </section>
  );
}

function Spec({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-xl border p-4">
      <div className="text-sm text-muted-foreground">{label}</div>

      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}
