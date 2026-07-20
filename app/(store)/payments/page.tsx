import { Suspense } from 'react';

import StoreLoadingState from '@/components/loading/StoreLoadingState';
import CheckoutExperience from '@/features/payments/components/CheckoutExperience';

export default function PaymentsPage() {
  return (
    <Suspense fallback={<StoreLoadingState label="Preparing secure checkout" />}>
      <CheckoutExperience />
    </Suspense>
  );
}
