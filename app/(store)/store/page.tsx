import FeedExperienceWorkspace from '@/features/feed-experience/layout/FeedExperienceWorkspace';
import { Suspense } from 'react';
// import FeedExperienceWorkspace from './StorePageClien';

export default function AJStorePage() {
  return (
    <Suspense fallback={null}>
      <FeedExperienceWorkspace />
    </Suspense>
  );
}
