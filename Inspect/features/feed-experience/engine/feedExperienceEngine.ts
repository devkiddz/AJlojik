import type {
  FeedContext,
  FeedExperience,
  FeedExperienceRegistryContract,
  FeedIntent
} from '../contracts';

import {
  buildSafeDiscoveryExperience
} from '../fallbacks';

export type FeedExperienceEngine = {
  resolve: (input: {
    intent: FeedIntent;
    context: FeedContext;
  }) => FeedExperience;
};

export function createFeedExperienceEngine(
  registry: FeedExperienceRegistryContract
): FeedExperienceEngine {
  return {
    resolve({
      intent,
      context
    }) {
      const definition =
        registry.resolve(
          intent,
          context
        );

      if (!definition) {
        return buildSafeDiscoveryExperience(
          intent,
          context,
          `No experience could resolve intent "${intent.type}".`
        );
      }

      try {
        return definition.build(
          intent,
          context
        );
      } catch (error) {
        const reason =
          error instanceof Error
            ? error.message
            : 'Unknown experience resolution error.';

        return buildSafeDiscoveryExperience(
          intent,
          context,
          reason
        );
      }
    }
  };
}