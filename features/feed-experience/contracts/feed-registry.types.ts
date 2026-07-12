import type { FeedContext } from "./feed-context.types";
import type { FeedExperience } from "./feed-experience.types";
import type { FeedIntent, FeedIntentType } from "./feed-intent.types";

export type FeedExperienceDefinition = {
  key: string;
  supports: FeedIntentType[];
  priority: number;
  version: number;
  fallbackKey?: string;
  canResolve: (intent: FeedIntent, context: FeedContext) => boolean;
  build: (intent: FeedIntent, context: FeedContext) => FeedExperience;
};

export type FeedExperienceRegistryContract = {
  register: (definition: FeedExperienceDefinition) => void;
  unregister: (key: string) => void;
  get: (key: string) => FeedExperienceDefinition | undefined;
  list: () => FeedExperienceDefinition[];
  resolve: (intent: FeedIntent, context: FeedContext) => FeedExperienceDefinition | undefined;
};
