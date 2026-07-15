import type { Prisma } from '@/lib/generated/prisma/client';

import type {
  ExperienceHistoryEntry,
  ExperienceHistorySource
} from '../experienceStackTypes';

type DatabaseHistoryEntry = {
  id: string;
  label: string;
  subtitle: string | null;

  categorySlug: string;
  source: ExperienceHistorySource;

  experienceId: string | null;
  campaignId: string | null;
  collectionId: string | null;
  productId: string | null;

  intentSnapshot: Prisma.JsonValue;
  contextSnapshot: Prisma.JsonValue | null;

  fingerprint: string;

  visitedAt: Date;
  expiresAt: Date | null;
};

function toJsonRecord(
  value: Prisma.JsonValue
): Record<string, unknown> {
  if (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  ) {
    return value as Record<string, unknown>;
  }

  return {};
}

export function mapExperienceHistoryEntry(
  entry: DatabaseHistoryEntry
): ExperienceHistoryEntry {
  return {
    id: entry.id,
    label: entry.label,
    subtitle: entry.subtitle,

    categorySlug: entry.categorySlug,
    source: entry.source,

    experienceId: entry.experienceId,
    campaignId: entry.campaignId,
    collectionId: entry.collectionId,
    productId: entry.productId,

    intentSnapshot: toJsonRecord(entry.intentSnapshot),

    contextSnapshot:
      entry.contextSnapshot === null
        ? null
        : toJsonRecord(entry.contextSnapshot),

    fingerprint: entry.fingerprint,

    visitedAt: entry.visitedAt.toISOString(),
    expiresAt: entry.expiresAt?.toISOString() ?? null
  };
}