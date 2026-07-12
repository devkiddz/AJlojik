import type { FeedContext } from "./feed-context.types";
import type { FeedIntent } from "./feed-intent.types";
import type { FeedModule } from "./feed-module.types";

export type FeedExperienceStatus = "resolved" | "fallback" | "empty" | "error";

export type FeedExperience = {
  id: string;
  key: string;
  intent: FeedIntent;
  context: FeedContext;
  modules: FeedModule[];
  status: FeedExperienceStatus;
  resolution: {
    registryKey: string;
    reason: string;
    usedFallback: boolean;
    fallbackKey?: string;
  };
  version: number;
  createdAt: string;
};
