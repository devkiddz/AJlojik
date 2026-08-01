import {
  Suspense
} from 'react';

import {
  DeliveryRiderExperience
} from '@/features/delivery-runtime/DeliveryRiderExperience';

export default function DeliveryAccessPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-dvh place-items-center">
          Verifying rider
          access…
        </main>
      }>
      <DeliveryRiderExperience />
    </Suspense>
  );
}
