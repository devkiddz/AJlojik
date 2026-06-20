import React from 'react';

export default function StoreAside() {
  return (
    <div className="sticky top-15 p-2 rounded-md bg-muted">
      <div>
        <h2 className="mb-3 text-sm font-semibold">Browse</h2>

        <div className="space-y-2">
          <button className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted">
            All Products
          </button>

          <button className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted">Kitchen</button>

          <button className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted">Wines</button>

          <button className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted">
            Party Plans
          </button>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="mb-3 text-sm font-semibold">Filters</h3>

        <div className="space-y-2 text-xs text-muted-foreground">
          <p>Price Range</p>
          <p>Availability</p>
          <p>Discounts</p>
          <p>Ratings</p>
        </div>
      </div>
    </div>
  );
}
