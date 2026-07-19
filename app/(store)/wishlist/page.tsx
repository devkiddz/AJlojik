'use client';

import ActionPageShell from '@/components/action-pages/ActionPageShell';
import { useWishlist } from '@/features/wishlist';

export default function WishlistPage() {
  const { count, loading, canPersist } = useWishlist();

  return (
    <ActionPageShell
      eyebrow="Your library"
      title="Saved products"
      description="A focused home for products you want to revisit, compare, or purchase later.">
      <div className="rounded-2xl border border-border/60 bg-background/55 p-5">
        <p className="text-sm text-muted-foreground">Saved products</p>
        <p className="mt-2 text-3xl font-bold">{loading ? '…' : count}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {canPersist ? 'Synced with your active workspace.' : 'Sign in to sync a wishlist across devices.'}
        </p>
      </div>
    </ActionPageShell>
  );
}
