import { ProductType } from '@/types';
import { categories } from '@/data/categories';

type Props = {
  product: ProductType;
};

export default function OverviewCard({ product }: Props) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <h3 className="mb-4 text-xl font-semibold">Product Description</h3>

      <p className="leading-7 text-muted-foreground">{product.longDescription}</p>

      <div className="mt-8">
        <h4 className="mb-4 font-medium">Highlights</h4>

        <div className="flex flex-wrap gap-2">
          {product.tags.map(tag => (
            <span key={tag} className="rounded-full border px-3 py-1 text-sm">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
