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

  if (process.env.NODE_ENV === 'development') {
    console.table(
      experience.modules.map(module => ({
        id: module.id,
        type: module.type,
        priority: module.priority
      }))
    );
  }

  return (
    <main aria-busy="false" data-experience-key={experience.key} data-experience-status={experience.status}>
      {/* ============================================
          TEMPORARY MODULE DIAGNOSTIC
      ============================================ */}
      {/* 
      {process.env.NODE_ENV === 'development' ? (
        <section
          className="
            mb-4 rounded-xl
            border border-dashed
            border-amber-500/40
            bg-amber-500/5
            px-3 py-2
          ">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">Resolved Feed Modules</p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {experience.modules.map(module => (
              <span
                key={`debug-${module.id}`}
                className="
                    rounded-md
                    bg-background
                    px-2 py-1
                    text-[10px]
                    text-muted-foreground
                    shadow-sm
                  ">
                {module.id}
                {' · '}
                {module.type}
              </span>
            ))}
          </div>
        </section>
      ) : null} */}

      {/* ============================================
          EXPERIENCE MODULES
      ============================================ */}

      <div className="space-y-4 md:space-y-8">
        {experience.modules.map(module => (
          <FeedModuleRenderer key={module.id} module={module} actions={actions} />
        ))}
      </div>
    </main>
  );
}
