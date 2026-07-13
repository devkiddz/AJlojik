import type { FeedModule } from '../contracts';

import type {
  ComposeExperienceModulesInput,
  ComposeExperienceModulesResult,
  ExperienceModuleCandidate
} from './experienceComposer.types';

/**
 * Checks whether a module contains useful renderable data.
 *
 * This prevents empty rails, collections and grids
 * from reaching the renderer.
 */
function hasRenderableData(module: FeedModule): boolean {
  switch (module.type) {
    case 'category-rail':
      return module.data.categories.length > 0;

    case 'promotion':
      return module.data.promotions.length > 0;

    case 'collection-feed':
      return module.data.collections.length > 0;

    case 'featured-products':
      return Boolean(
        module.data.featuredProduct ||
          module.data.featuredProducts.length > 0
      );

    case 'product-grid':
      return module.data.products.length > 0;

    case 'product-rail':
      return module.data.products.length > 0;

    case 'recently-viewed':
      return module.data.products.length > 0;

    case 'shopping-journey':
      return module.data.items.length > 0;

    default:
      return true;
  }
}

function resolveRejectionReason(
  candidate: ExperienceModuleCandidate
): string | null {
  if (candidate.enabled === false) {
    return candidate.reason ?? 'Module candidate was disabled.';
  }

  if (!hasRenderableData(candidate.module)) {
    return candidate.reason ?? 'Module contains no renderable data.';
  }

  return null;
}

/**
 * Composes the final ordered module collection.
 *
 * Responsibilities:
 * 1. Remove disabled candidates.
 * 2. Remove empty modules.
 * 3. Remove duplicate IDs.
 * 4. Sort modules by priority.
 * 5. Optionally limit the result.
 */
export function composeExperienceModules({
  candidates,
  limit
}: ComposeExperienceModulesInput): ComposeExperienceModulesResult {
  const accepted: FeedModule[] = [];
  const acceptedIds = new Set<string>();

  const diagnostics: ComposeExperienceModulesResult['diagnostics'] = {
    accepted: [],
    rejected: []
  };

  for (const candidate of candidates) {
    const { module } = candidate;

    const rejectionReason =
      resolveRejectionReason(candidate);

    if (rejectionReason) {
      diagnostics.rejected.push({
        id: module.id,
        reason: rejectionReason
      });

      continue;
    }

    if (acceptedIds.has(module.id)) {
      diagnostics.rejected.push({
        id: module.id,
        reason: `Duplicate module ID "${module.id}".`
      });

      continue;
    }

    acceptedIds.add(module.id);
    accepted.push(module);
    diagnostics.accepted.push(module.id);
  }

  const orderedModules = accepted.sort(
    (firstModule, secondModule) =>
      secondModule.priority -
      firstModule.priority
  );

  return {
    modules:
      typeof limit === 'number'
        ? orderedModules.slice(0, limit)
        : orderedModules,

    diagnostics
  };
}