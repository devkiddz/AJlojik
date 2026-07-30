'use client';

import FeedExperienceLoader from '../providers/FeedExperienceLoader';

import {
  useFeedExperienceContext
} from '../providers/FeedExperienceProvider';

import {
  FeedModuleRenderer
} from './FeedModuleRenderer';

export function FeedRenderer() {
  const {
    experience,
    actions,
    isResolving,
    pendingIntent
  } = useFeedExperienceContext();

  if (isResolving) {
    return (
      <main
        aria-busy="true"
        aria-live="polite">
        <FeedExperienceLoader
          intentType={
            pendingIntent?.type
          }
        />
      </main>
    );
  }

  if (
    process.env.NODE_ENV ===
    'development'
  ) {
    console.table(
      experience.modules.map(
        module => ({
          id:
            module.id,

          type:
            module.type,

          priority:
            module.priority
        })
      )
    );
  }

  return (
    <main
      aria-busy="false"
      data-experience-key={
        experience.key
      }
      data-experience-status={
        experience.status
      }>
      <div className="space-y-4 md:space-y-5">
        {experience.modules.map(
          module => (
            <FeedModuleRenderer
              key={module.id}
              module={module}
              actions={actions}
            />
          )
        )}
      </div>
    </main>
  );
}
