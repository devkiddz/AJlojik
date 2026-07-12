import { Star } from 'lucide-react';
import { ProductType } from '@/types/types';
import { categories } from '@/data/categories';

type Props = {
  product: ProductType;
};
export default function ReviewsCard({ product }: Props) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border">
          <span className="text-3xl font-bold">{product.rating}</span>
        </div>

        <div>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>

          <p className="text-muted-foreground">Based on {product.reviews} reviews</p>
        </div>
      </div>

      <div className="space-y-4">
        {[
          'Excellent product quality and very fast delivery.',
          'Exactly as described. Packaging was great.',
          'Would definitely order again.'
        ].map(review => (
          <div key={review} className="rounded-xl border p-4">
            <p className="text-muted-foreground">{review}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
