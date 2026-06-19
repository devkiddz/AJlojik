// app/(store)/store/page.tsx

import StoreProductsGrid from '@/components/store/StoreProductsGrid';
import StoreFilters from './StoreFilters';

export default function StorePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mt-6">
        <StoreFilters />
      </div>

      <div className="mt-8">
        <StoreProductsGrid />
      </div>
    </div>
  );
}
