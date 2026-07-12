'use client';

import { useFeedExperience } from '../hooks';
import { FeedModuleRenderer } from './FeedModuleRenderer';

export function FeedRenderer() {
  const { experience, actions, context } = useFeedExperience();

  console.table(
    experience.modules.map(module => ({
      id: module.id,
      type: module.type,
      priority: module.priority
    }))
  );

  console.log('Active user:', context.user);
  console.log('Active activity:', context.activity);

  return (
    <main>
      <div className="space-y-4 md:space-y-8">
        {experience.modules.map(module => (
          <FeedModuleRenderer key={module.id} module={module} actions={actions} />
        ))}
      </div>
    </main>
  );
}
