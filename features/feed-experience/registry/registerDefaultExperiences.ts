import { buildStoreDiscoveryExperience } from "../builders";
import type { FeedExperienceRegistryContract } from "../contracts";

export function registerDefaultExperiences(registry: FeedExperienceRegistryContract): void {
  registry.register({
    key: "default-store-discovery",
    supports: ["store-discovery", "home", "category"],
    priority: 100,
    version: 1,
    fallbackKey: "safe-store-discovery",
    canResolve: (_intent, context) => context.catalog.categories.length > 0,
    build: buildStoreDiscoveryExperience,
  });
}
