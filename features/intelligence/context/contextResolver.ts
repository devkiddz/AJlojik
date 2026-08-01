import {
  createEmptyIntelligenceContext,
  uniqueIntelligenceIds
} from '../domain';

import type {
  IntelligenceContextAdapter,
  IntelligenceContextRequest,
  IntelligenceContextResolution,
  IntelligenceContextSection
} from './contextContracts';

import {
  defaultIntelligenceContextAdapters
} from './defaultAdapters';

export class IntelligenceContextResolver {
  private readonly adapters:
    IntelligenceContextAdapter[];

  constructor(
    adapters:
      IntelligenceContextAdapter[] =
        defaultIntelligenceContextAdapters
  ) {
    this.adapters =
      adapters;
  }

  async resolve(
    request:
      IntelligenceContextRequest,
    capturedAt =
      new Date().toISOString()
  ): Promise<IntelligenceContextResolution> {
    const snapshot =
      createEmptyIntelligenceContext(
        capturedAt
      );

    const warnings:
      string[] = [];

    const usedAdapters:
      string[] = [];

    for (
      const adapter of
      this.adapters
    ) {
      if (
        !adapter.supports(
          request
        )
      ) {
        continue;
      }

      try {
        const result =
          await adapter.resolve(
            request
          );

        snapshot[
          result.section
        ] = {
          ...snapshot[
            result.section
          ],
          ...result.data
        };

        mergeReferences(
          snapshot.references,
          result.references
        );

        warnings.push(
          ...(
            result.warnings ??
            []
          )
        );

        usedAdapters.push(
          adapter.id
        );
      } catch (
        error
      ) {
        warnings.push(
          `${adapter.id}: ${
            error instanceof
            Error
              ? error.message
              : String(
                  error
                )
          }`
        );
      }
    }

    return {
      snapshot,
      warnings,
      adapters:
        usedAdapters
    };
  }
}

function mergeReferences(
  target:
    IntelligenceContextResolution['snapshot']['references'],
  incoming:
    Partial<
      IntelligenceContextResolution['snapshot']['references']
    > |
    undefined
): void {
  if (!incoming) {
    return;
  }

  for (
    const key of
    Object.keys(
      target
    ) as (
      keyof typeof target
    )[]
  ) {
    target[
      key
    ] =
      uniqueIntelligenceIds([
        ...target[
          key
        ],
        ...(
          incoming[
            key
          ] ??
          []
        )
      ]);
  }
}

export function createStaticContextAdapter(
  id: string,
  section:
    IntelligenceContextSection,
  data:
    Record<string, unknown>
): IntelligenceContextAdapter {
  return {
    id,
    section,
    supports:
      () =>
        true,
    async resolve() {
      return {
        section,
        data
      };
    }
  };
}
