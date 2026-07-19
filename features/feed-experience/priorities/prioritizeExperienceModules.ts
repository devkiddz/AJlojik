import type {
  FeedModule
} from '../contracts';

import type {
  ExperiencePriorityResult,
  PrioritizeExperienceModulesInput,
  PrioritizeExperienceModulesResult
} from './experiencePriority.types';

import {
  resolveModulePrioritySignals
} from './resolveModulePrioritySignals';

type IndexedFeedModule = {
  module: FeedModule;
  originalIndex: number;
};

function getFinalPriority(
  module: FeedModule,
  priorityMap: Map<
    string,
    ExperiencePriorityResult
  >
): number {
  return (
    priorityMap.get(module.id)
      ?.finalPriority ??
    module.priority
  );
}

/**
 * Determines the runtime order of Feed modules.
 *
 * Rules:
 *
 * 1. Category Rail remains pinned to the beginning.
 * 2. Higher contextual priority appears first.
 * 3. Higher base priority resolves contextual ties.
 * 4. Original builder order resolves final ties.
 */
function compareModules(
  first: IndexedFeedModule,
  second: IndexedFeedModule,
  priorityMap: Map<
    string,
    ExperiencePriorityResult
  >
): number {
  const firstIsCategoryRail =
    first.module.type ===
    'category-rail';

  const secondIsCategoryRail =
    second.module.type ===
    'category-rail';

  if (
    firstIsCategoryRail &&
    secondIsCategoryRail
  ) {
    return (
      first.originalIndex -
      second.originalIndex
    );
  }

  if (firstIsCategoryRail) {
    return -1;
  }

  if (secondIsCategoryRail) {
    return 1;
  }

  const finalPriorityDifference =
    getFinalPriority(
      second.module,
      priorityMap
    ) -
    getFinalPriority(
      first.module,
      priorityMap
    );

  if (
    finalPriorityDifference !== 0
  ) {
    return finalPriorityDifference;
  }

  const basePriorityDifference =
    second.module.priority -
    first.module.priority;

  if (
    basePriorityDifference !== 0
  ) {
    return basePriorityDifference;
  }

  return (
    first.originalIndex -
    second.originalIndex
  );
}

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

  const priorityMap =
    new Map<
      string,
      ExperiencePriorityResult
    >(
      priorities.map(
        priority => [
          priority.moduleId,
          priority
        ]
      )
    );

  const orderedModules =
    modules
      .map(
        (
          module,
          originalIndex
        ): IndexedFeedModule => ({
          module,
          originalIndex
        })
      )
      .sort(
        (
          first,
          second
        ) =>
          compareModules(
            first,
            second,
            priorityMap
          )
      )
      .map(
        indexedModule =>
          indexedModule.module
      );

  /**
   * Keep diagnostics in the same order as the modules
   * that will actually reach the renderer.
   */
  const moduleOrderMap =
    new Map(
      orderedModules.map(
        (
          module,
          index
        ) => [
          module.id,
          index
        ]
      )
    );

  const orderedPriorities =
    [...priorities].sort(
      (
        first,
        second
      ) =>
        (moduleOrderMap.get(
          first.moduleId
        ) ?? Number.MAX_SAFE_INTEGER) -
        (moduleOrderMap.get(
          second.moduleId
        ) ?? Number.MAX_SAFE_INTEGER)
    );

  return {
    modules:
      orderedModules,

    priorities:
      orderedPriorities
  };
}