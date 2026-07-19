import type {
  FeedModule
} from '../contracts';

import type {
  ComposeExperienceModulesInput,
  ComposeExperienceModulesResult,
  ExperienceModuleCandidate
} from './experienceComposer.types';

// ============================================================
// RENDERABILITY
// ============================================================

/**
 * Determines whether a resolved module contains enough data
 * to produce a meaningful visual section.
 *
 * Business selection belongs to builders and selectors.
 * This check only prevents empty module shells from reaching
 * the renderer.
 */
function hasRenderableData(
  module: FeedModule
): boolean {
  switch (module.type) {
    case 'category-rail':
      return (
        module.data.categories.length >
        0
      );

    case 'shopping-journey':
      return (
        module.data.items.length >
        0
      );

    case 'product-experience-banner':
      return Boolean(
        module.data.product
      );

    case 'promotion':
      return (
        module.data.promotions.length >
        0
      );

    case 'collection-feed':
      return (
        module.data.collections.length >
        0
      );

   case 'featured-products':
  return Boolean(
    module.data.featuredProduct ||
      module.data.featuredProducts.length > 0
  );

    case 'product-grid':
      return (
        module.data.products.length >
        0
      );

    case 'product-rail':
      return (
        module.data.products.length >
        0
      );

    case 'recently-viewed':
      return (
        module.data.products.length >
        0
      );

    default:
      /**
       * Unknown future module types are allowed through.
       *
       * Their own renderer remains responsible for deciding
       * whether it can render its contract.
       */
      return true;
  }
}

// ============================================================
// REJECTION
// ============================================================

function resolveRejectionReason(
  candidate: ExperienceModuleCandidate
): string | null {
  if (
    candidate.enabled === false
  ) {
    return (
      candidate.reason ??
      'Module candidate was disabled.'
    );
  }

  if (
    !hasRenderableData(
      candidate.module
    )
  ) {
    return (
      candidate.reason ??
      'Module contains no renderable data.'
    );
  }

  return null;
}

// ============================================================
// ORDERING
// ============================================================

type OrderedCandidate = {
  candidate: ExperienceModuleCandidate;
  originalIndex: number;
};

/**
 * Orders candidates before duplicate detection.
 *
 * This guarantees that when two candidates accidentally use
 * the same module ID, the candidate with the higher priority
 * becomes the accepted definition.
 */
function orderCandidates(
  candidates:
    ExperienceModuleCandidate[]
): OrderedCandidate[] {
  return candidates
    .map(
      (
        candidate,
        originalIndex
      ) => ({
        candidate,
        originalIndex
      })
    )
    .sort(
      (
        first,
        second
      ) => {
        const priorityDifference =
          second.candidate.module
            .priority -
          first.candidate.module
            .priority;

        if (
          priorityDifference !== 0
        ) {
          return priorityDifference;
        }

        return (
          first.originalIndex -
          second.originalIndex
        );
      }
    );
}

// ============================================================
// COMPOSITION
// ============================================================

/**
 * Produces the final collection of Feed modules.
 *
 * Responsibilities:
 *
 * 1. Remove explicitly disabled candidates.
 * 2. Remove candidates without renderable data.
 * 3. Prevent duplicate module IDs.
 * 4. Preserve deterministic priority ordering.
 * 5. Apply an optional module limit.
 *
 * The composer does not decide business ownership.
 * Builders determine which candidates should be enabled.
 */
export function composeExperienceModules({
  candidates,
  limit
}: ComposeExperienceModulesInput): ComposeExperienceModulesResult {
  const acceptedModules:
    FeedModule[] = [];

  const acceptedIds =
    new Set<string>();

  const diagnostics: ComposeExperienceModulesResult['diagnostics'] =
    {
      accepted: [],
      rejected: []
    };

  const orderedCandidates =
    orderCandidates(candidates);

  for (const {
    candidate
  } of orderedCandidates) {
    const {
      module
    } = candidate;

    const rejectionReason =
      resolveRejectionReason(
        candidate
      );

    if (rejectionReason) {
      diagnostics.rejected.push({
        id: module.id,
        reason:
          rejectionReason
      });

      continue;
    }

    if (
      acceptedIds.has(module.id)
    ) {
      diagnostics.rejected.push({
        id: module.id,

        reason:
          `Duplicate module ID "${module.id}".`
      });

      continue;
    }

    acceptedIds.add(module.id);

    acceptedModules.push(module);

    diagnostics.accepted.push(
      module.id
    );
  }

  const resolvedLimit =
    typeof limit === 'number' &&
    Number.isFinite(limit)
      ? Math.max(
          0,
          Math.floor(limit)
        )
      : null;

  const modules =
    resolvedLimit === null
      ? acceptedModules
      : acceptedModules.slice(
          0,
          resolvedLimit
        );

  if (
    process.env.NODE_ENV ===
    'development'
  ) {
    console.table([
      ...diagnostics.accepted.map(
        id => ({
          moduleId: id,
          status: 'accepted',
          reason: ''
        })
      ),

      ...diagnostics.rejected.map(
        rejection => ({
          moduleId:
            rejection.id,

          status:
            'rejected',

          reason:
            rejection.reason
        })
      )
    ]);
  }

  return {
    modules,
    diagnostics
  };
}