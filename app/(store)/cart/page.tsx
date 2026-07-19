'use client';

import ActionPageShell from '@/components/action-pages/ActionPageShell';
import { useCart } from '@/features/cart';

export default function CartPage() {
  const { itemCount, totalQuantity, subtotal, loading } = useCart();

  return (
    <ActionPageShell
      eyebrow="Shopping activity"
      title="Your cart"
      description="Review the products connected to your current AJ Logik shopping session.">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ['Selections', loading ? '…' : itemCount],
          ['Total units', loading ? '…' : totalQuantity],
          ['Subtotal', loading ? '…' : new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(subtotal)]
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-border/60 bg-background/55 p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-2 text-xl font-bold">{value}</p>
          </div>
        ))}
      </div>
    </ActionPageShell>
  );
}
