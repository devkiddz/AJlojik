import { ShieldCheck } from 'lucide';
import { Package, ShieldCheckIcon, Truck } from 'lucide-react';

export default function ShippingCard() {
  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border p-6">
        <Truck className="mb-4 h-6 w-6" />

        <h3 className="mb-2 font-semibold">Delivery</h3>

        <p className="text-sm text-muted-foreground">Fast and secure shipping.</p>
      </div>

      <div className="rounded-2xl border p-6">
        <Package className="mb-4 h-6 w-6" />

        <h3 className="mb-2 font-semibold">Returns</h3>

        <p className="text-sm text-muted-foreground">Easy returns within 7 days.</p>
      </div>

      <div className="rounded-2xl border p-6">
        <ShieldCheckIcon className="mb-4 h-6 w-6" />

        <h3 className="mb-2 font-semibold">Support</h3>

        <p className="text-sm text-muted-foreground">Dedicated customer support.</p>
      </div>
    </div>
  );
}
