import InfoRow from './InfoRow';
import { ProductType } from '@/types/types';
import { categories } from '@/data/categories';

type Props = {
  product: ProductType;
};
export default function DetailsCard({ product }: Props) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <h3 className="mb-6 text-xl font-semibold">Product Information</h3>

      <div className="space-y-4">
        <InfoRow label="Category" value={product.category} />

        <InfoRow label="Rating" value={`${product.rating}/5`} />

        <InfoRow label="Reviews" value={`${product.reviews}`} />

        <InfoRow label="Units Sold" value={`${product.soldCount}`} />

        <InfoRow label="Delivery" value={product.estimatedDelivery} />
      </div>

      <div className="mt-8">
        <h4 className="mb-4 font-medium">Available Variants</h4>

        <div className="space-y-3">
          {product.variants.map(variant => (
            <div key={variant.id} className="flex items-center justify-between rounded-xl border p-4">
              <div>
                <p className="font-medium">{variant.label}</p>

                <p className="text-sm text-muted-foreground">
                  {variant.stockLeft > 0 ? `${variant.stockLeft} left` : 'Out of stock'}
                </p>
              </div>

              <span className="font-semibold">₦{variant.price.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
