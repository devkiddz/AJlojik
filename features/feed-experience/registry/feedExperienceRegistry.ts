import type {
  FeedContext,
  FeedExperienceDefinition,
  FeedExperienceRegistryContract,
  FeedIntent
} from '../contracts';

type RegisteredExperienceDefinition = {
  definition: FeedExperienceDefinition;
  registrationOrder: number;
};

export class FeedExperienceRegistry
  implements FeedExperienceRegistryContract
{
  private readonly definitions =
    new Map<
      string,
      RegisteredExperienceDefinition
    >();

  private registrationSequence = 0;

  // ==========================================================
  // REGISTRATION
  // ==========================================================

  register(
    definition: FeedExperienceDefinition
  ): void {
    this.assertValidDefinition(
      definition
    );

    const existingDefinition =
      this.definitions.get(
        definition.key
      );

    /**
     * Re-registering the same key replaces its definition,
     * but preserves its original registration position.
     *
     * This keeps development refreshes and controlled
     * overrides deterministic.
     */
    const registrationOrder =
      existingDefinition
        ?.registrationOrder ??
      this.registrationSequence++;

    if (
      existingDefinition &&
      process.env.NODE_ENV ===
        'development'
    ) {
      console.warn(
        `[FeedExperienceRegistry] Replacing registered experience "${definition.key}".`
      );
    }

    this.definitions.set(
      definition.key,
      {
        definition,
        registrationOrder
      }
    );
  }

  unregister(key: string): void {
    this.definitions.delete(key);
  }

  // ==========================================================
  // ACCESS
  // ==========================================================

  get(
    key: string
  ):
    | FeedExperienceDefinition
    | undefined {
    return this.definitions.get(
      key
    )?.definition;
  }

  list(): FeedExperienceDefinition[] {
    return [
      ...this.definitions.values()
    ]
      .sort(
        (
          first,
          second
        ) => {
          const priorityDifference =
            second.definition
              .priority -
            first.definition
              .priority;

          if (
            priorityDifference !== 0
          ) {
            return priorityDifference;
          }

          const registrationDifference =
            first.registrationOrder -
            second.registrationOrder;

          if (
            registrationDifference !== 0
          ) {
            return registrationDifference;
          }

          return first.definition.key.localeCompare(
            second.definition.key
          );
        }
      )
      .map(
        registeredDefinition =>
          registeredDefinition.definition
      );
  }

  // ==========================================================
  // RESOLUTION
  // ==========================================================

  resolve(
    intent: FeedIntent,
    context: FeedContext
  ):
    | FeedExperienceDefinition
    | undefined {
    const definitions =
      this.list();

    for (const definition of definitions) {
      if (
        !definition.supports.includes(
          intent.type
        )
      ) {
        continue;
      }

      try {
        if (
          definition.canResolve(
            intent,
            context
          )
        ) {
          return definition;
        }
      } catch (error) {
        /**
         * One broken resolver must not prevent lower-priority
         * compatible definitions from being considered.
         */
        if (
          process.env.NODE_ENV ===
          'development'
        ) {
          console.error(
            `[FeedExperienceRegistry] Experience "${definition.key}" failed while checking intent "${intent.type}".`,
            error
          );
        }
      }
    }

    if (
      process.env.NODE_ENV ===
      'development'
    ) {
      console.warn(
        `[FeedExperienceRegistry] No registered experience could resolve intent "${intent.type}".`
      );
    }

    return undefined;
  }

  // ==========================================================
  // VALIDATION
  // ==========================================================

  private assertValidDefinition(
    definition: FeedExperienceDefinition
  ): void {
    if (
      !definition.key.trim()
    ) {
      throw new Error(
        'A Feed experience definition requires a non-empty key.'
      );
    }

    if (
      definition.supports.length ===
      0
    ) {
      throw new Error(
        `Feed experience "${definition.key}" must support at least one intent type.`
      );
    }

    if (
      !Number.isFinite(
        definition.priority
      )
    ) {
      throw new Error(
        `Feed experience "${definition.key}" has an invalid priority.`
      );
    }

    if (
      typeof definition.canResolve !==
      'function'
    ) {
      throw new Error(
        `Feed experience "${definition.key}" requires a canResolve function.`
      );
    }

    if (
      typeof definition.build !==
      'function'
    ) {
      throw new Error(
        `Feed experience "${definition.key}" requires a build function.`
      );
    }
  }
}