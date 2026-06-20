import React from 'react';

export default function StoreRightPannel() {
  return (
    <div className="sticky top-15 space-y-4">
      {/* CART */}
      <div className="rounded-2xl bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold">Shopping Cart</h2>

        <p className="text-xs text-muted-foreground">No items added yet.</p>
      </div>

      {/* DEALS */}
      <div className="rounded-2xl border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold">Today&rsquo;s Deals</h2>

        <div className="space-y-2 text-xs">
          <p>🔥 Wine Discounts</p>
          <p>🚚 Free Delivery</p>
          <p>⭐ Featured Picks</p>
        </div>
      </div>

      {/* RECENT */}
      <div className="rounded-2xl border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold">Recently Viewed</h2>

        <p className="text-xs text-muted-foreground">Your recently viewed products will appear here.</p>
      </div>
    </div>
  );
}
