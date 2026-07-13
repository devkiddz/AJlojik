import type {
  FeedModule
} from '../contracts';

import {
  resolveModulePrioritySignals
} from './resolveModulePrioritySignals';

import type {
  ExperiencePriorityResult,
  PrioritizeExperienceModulesInput,
  PrioritizeExperienceModulesResult
} from './experiencePriority.types';

export function prioritizeExperienceModules({
  modules,
  context
}: PrioritizeExperienceModulesInput): PrioritizeExperienceModulesResult {
  const priorities: ExperiencePriorityResult[] =
    modules.map(module => {
      const signals =
        resolveModulePrioritySignals({
          module,
          context
        });

      const contextualScore =
        signals.reduce(
          (
            totalScore,
            signal
          ) =>
            totalScore +
            signal.score,
          0
        );

      return {
        moduleId: module.id,
        moduleType: module.type,
        basePriority:
          module.priority,
        contextualScore,
        finalPriority:
          module.priority +
          contextualScore,
        signals
      };
    });

  const priorityMap = new Map(
    priorities.map(priority => [
      priority.moduleId,
      priority
    ])
  );

const orderedModules: FeedModule[] =
  [...modules].sort(
    (
      firstModule,
      secondModule
    ) => {
      if (
        firstModule.type ===
        'category-rail'
      ) {
        return -1;
      }

      if (
        secondModule.type ===
        'category-rail'
      ) {
        return 1;
      }

      const firstPriority =
        priorityMap.get(
          firstModule.id
        );

      const secondPriority =
        priorityMap.get(
          secondModule.id
        );

      return (
        (secondPriority?.finalPriority ??
          secondModule.priority) -
        (firstPriority?.finalPriority ??
          firstModule.priority)
      );
    }
  );

  return {
    modules: orderedModules,
    priorities: [...priorities].sort(
      (
        firstPriority,
        secondPriority
      ) =>
        secondPriority.finalPriority -
        firstPriority.finalPriority
    )
  };
}