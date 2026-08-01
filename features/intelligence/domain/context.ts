import type {
  IntelligenceContextReferences,
  IntelligenceContextSnapshot
} from './contracts';

export const EMPTY_INTELLIGENCE_REFERENCES:
  IntelligenceContextReferences = {
    productIds: [],
    categoryIds: [],
    shoppingListIds: [],
    orderIds: [],
    campaignIds: [],
    approvalRequestIds: []
  };

export function createEmptyIntelligenceContext(
  capturedAt =
    new Date().toISOString()
): IntelligenceContextSnapshot {
  return {
    capturedAt,
    identity: {},
    experience: {},
    commerce: {},
    behaviour: {},
    operations: {},
    references: {
      ...EMPTY_INTELLIGENCE_REFERENCES
    }
  };
}

export function normalizeIntelligenceRecord(
  value: unknown
): Record<string, unknown> {
  if (
    !value ||
    typeof value !==
      'object' ||
    Array.isArray(value)
  ) {
    return {};
  }

  return value as
    Record<string, unknown>;
}

export function uniqueIntelligenceIds(
  values: readonly (
    | string
    | null
    | undefined
  )[]
): string[] {
  return [
    ...new Set(
      values
        .filter(
          (
            value
          ): value is string =>
            typeof value ===
              'string' &&
            value.trim().length >
              0
        )
        .map(value =>
          value.trim()
        )
    )
  ];
}
