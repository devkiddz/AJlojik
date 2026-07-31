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

/**
 * Store discovery has a deliberate entrance sequence that must not be
 * displaced by contextual scoring. Missing modules simply collapse out
 * of the sequence while the remaining structural modules keep their order.
 */
const STRUCTURAL_MODULE_ORDER = new Map<string, number>([
  ['store-showcase', 0],
  ['store-category-rail', 1],
  ['shopping-journey', 2],
  ['store-reels', 3]
]);

function getStructuralOrder(module: FeedModule): number | null {
  return STRUCTURAL_MODULE_ORDER.get(module.id) ?? null;
}

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
 * 1. Store Showcase → Categories → Shopping Journey → Store Reels.
 * 2. Higher contextual priority appears first for remaining modules.
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
  const firstStructuralOrder =
    getStructuralOrder(first.module);

  const secondStructuralOrder =
    getStructuralOrder(second.module);

  if (
    firstStructuralOrder !== null ||
    secondStructuralOrder !== null
  ) {
    if (firstStructuralOrder === null) {
      return 1;
    }

    if (secondStructuralOrder === null) {
      return -1;
    }

    return firstStructuralOrder - secondStructuralOrder;
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