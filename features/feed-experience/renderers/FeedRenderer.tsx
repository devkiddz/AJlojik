'use client';

import FeedExperienceLoader from '../providers/FeedExperienceLoader';
import { useFeedExperienceContext } from '../providers/FeedExperienceProvider';

import { FeedModuleRenderer } from './FeedModuleRenderer';

export function FeedRenderer() {
  const { experience, actions, isResolving, pendingIntent } = useFeedExperienceContext();

  if (isResolving) {
    return (
      <main aria-busy="true" aria-live="polite">
        <FeedExperienceLoader intentType={pendingIntent?.type} />
      </main>
    );
  }

  return (
    <main aria-busy="false" data-experience-key={experience.key} data-experience-status={experience.status}>
      <div className="space-y-4 md:space-y-8">
        {experience.modules.map(module => (
          <FeedModuleRenderer key={module.id} module={module} actions={actions} />
        ))}
      </div>
    </main>
  );
}
