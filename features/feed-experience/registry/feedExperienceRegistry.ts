import type { FeedContext, FeedExperienceDefinition, FeedExperienceRegistryContract, FeedIntent } from "../contracts";

export class FeedExperienceRegistry implements FeedExperienceRegistryContract {
  private readonly definitions = new Map<string, FeedExperienceDefinition>();
  register(definition: FeedExperienceDefinition): void { this.definitions.set(definition.key, definition); }
  unregister(key: string): void { this.definitions.delete(key); }
  get(key: string): FeedExperienceDefinition | undefined { return this.definitions.get(key); }
  list(): FeedExperienceDefinition[] { return [...this.definitions.values()].sort((a, b) => b.priority - a.priority); }
  resolve(intent: FeedIntent, context: FeedContext): FeedExperienceDefinition | undefined {
    return this.list().find((definition) => definition.supports.includes(intent.type) && definition.canResolve(intent, context));
  }
}
