import StorePageClient from '@/components/store/StorePageClient';
import { Suspense } from 'react';
// import StorePageClient from './StorePageClien';

export default function AJStorePage() {
  return (
    <Suspense fallback={null}>
      <StorePageClient />
    </Suspense>
  );
}
