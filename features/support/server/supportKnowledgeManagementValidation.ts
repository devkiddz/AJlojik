import {
  SUPPORT_GUIDE_INTENTS
} from '../supportGuideTypes';
import type {
  SupportGuideIntent
} from '../supportGuideTypes';
import {
  SUPPORT_KNOWLEDGE_STATUSES
} from '../supportKnowledgeTypes';
import type {
  SupportKnowledgeMutation,
  SupportKnowledgeMutationExample
} from '../supportKnowledgeManagementTypes';

const MAX_EXAMPLES = 100;
const MAX_ACTIONS = 20;

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function text(
  value: unknown,
  label: string,
  options: { minimum?: number; maximum: number; nullable?: boolean }
): string | null {
  if (value === null || value === undefined) {
    if (options.nullable) return null;
    throw new Error(`${label} is required.`);
  }

  if (typeof value !== 'string') {
    throw new Error(`${label} must be text.`);
  }

  const normalized = value.trim();
  if (!normalized && options.nullable) return null;

  if (normalized.length < (options.minimum ?? 1)) {
    throw new Error(`${label} is too short.`);
  }

  if (normalized.length > options.maximum) {
    throw new Error(`${label} is too long.`);
  }

  return normalized;
}

function numberValue(
  value: unknown,
  label: string,
  minimum: number,
  maximum: number,
  fallback: number
): number {
  const resolved =
    value === undefined || value === null || value === ''
      ? fallback
      : Number(value);

  if (!Number.isFinite(resolved) || resolved < minimum || resolved > maximum) {
    throw new Error(`${label} must be between ${minimum} and ${maximum}.`);
  }

  return resolved;
}

export function slugifySupportKnowledge(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export function normalizeSupportKnowledgeList(
  value: unknown,
  maximum = 80
): string[] {
  const source = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/[\n,]+/)
      : [];
  const unique = new Map<string, string>();

  for (const candidate of source) {
    if (typeof candidate !== 'string') continue;
    const normalized = candidate.trim().replace(/\s+/g, ' ');
    if (!normalized || normalized.length > 160) continue;
    const key = normalized.toLowerCase();
    if (!unique.has(key)) unique.set(key, normalized);
    if (unique.size >= maximum) break;
  }

  return [...unique.values()];
}

function normalizeExamples(value: unknown): SupportKnowledgeMutationExample[] {
  const source = Array.isArray(value) ? value : [];
  const unique = new Map<string, SupportKnowledgeMutationExample>();

  for (const raw of source.slice(0, MAX_EXAMPLES)) {
    const item = record(raw);
    if (!item) continue;
    const exampleText = text(item.text, 'Question example', { maximum: 500 });
    if (!exampleText) continue;
    const key = exampleText.toLowerCase();
    if (unique.has(key)) continue;

    unique.set(key, {
      text: exampleText,
      locale:
        text(item.locale ?? 'en-NG', 'Example locale', { maximum: 24 }) ??
        'en-NG',
      weight: numberValue(item.weight, 'Example weight', 0.1, 10, 1),
      active: item.active !== false
    });
  }

  return [...unique.values()];
}

function normalizeActions(value: unknown): Array<Record<string, unknown>> {
  if (value === null || value === undefined) return [];
  if (!Array.isArray(value)) throw new Error('Actions must be a JSON array.');
  if (value.length > MAX_ACTIONS) {
    throw new Error(`Actions cannot exceed ${MAX_ACTIONS} items.`);
  }

  return value.map((candidate, index) => {
    const item = record(candidate);
    if (!item) throw new Error(`Action ${index + 1} must be a JSON object.`);
    const kind = String(item.kind ?? '');
    if (!['NAVIGATE', 'FOLLOW_UP', 'HUMAN_HANDOFF'].includes(kind)) {
      throw new Error(`Action ${index + 1} has an invalid kind.`);
    }

    return {
      ...item,
      id: text(item.id, `Action ${index + 1} ID`, { maximum: 120 }),
      label: text(item.label, `Action ${index + 1} label`, { maximum: 120 }),
      kind
    };
  });
}

function supportGuideIntent(value: unknown): SupportGuideIntent {
  const normalized = String(value ?? '');
  if (!SUPPORT_GUIDE_INTENTS.some(intent => intent === normalized)) {
    throw new Error('A valid Support Guide intent is required.');
  }
  return normalized as SupportGuideIntent;
}

export function parseSupportKnowledgeMutation(value: unknown): SupportKnowledgeMutation {
  const input = record(value);
  if (!input) throw new Error('Support Knowledge input is required.');

  const title = text(input.title, 'Title', { maximum: 180 })!;
  const slugCandidate = text(input.slug, 'Slug', {
    maximum: 120,
    nullable: true
  });
  const slug = slugifySupportKnowledge(slugCandidate ?? title);
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error('The Support Knowledge slug is invalid.');
  }

  const category = text(input.category, 'Category', { maximum: 80 })!
    .toUpperCase()
    .replace(/[^A-Z0-9_:-]+/g, '_');
  const status = String(input.status ?? 'DRAFT');
  if (!SUPPORT_KNOWLEDGE_STATUSES.some(candidate => candidate === status)) {
    throw new Error('A valid Support Knowledge status is required.');
  }

  const examples = normalizeExamples(input.examples);
  if (status === 'ACTIVE' && !examples.length) {
    throw new Error('Active Support Knowledge requires at least one question example.');
  }

  const conditions =
    input.conditions === null || input.conditions === undefined
      ? null
      : record(input.conditions);
  if (
    input.conditions !== null &&
    input.conditions !== undefined &&
    !conditions
  ) {
    throw new Error('Conditions must be a JSON object.');
  }

  return {
    bucketId: text(input.bucketId, 'Knowledge bucket', {
      maximum: 160,
      nullable: true
    }),
    slug,
    title,
    category,
    intent: supportGuideIntent(input.intent),
    primaryQuestion: text(input.primaryQuestion, 'Primary question', {
      maximum: 500
    })!,
    answerTemplate: text(input.answerTemplate, 'Approved answer', {
      maximum: 10000
    })!,
    clarificationAnswer: text(input.clarificationAnswer, 'Clarification answer', {
      maximum: 4000,
      nullable: true
    }),
    escalationAnswer: text(input.escalationAnswer, 'Escalation answer', {
      maximum: 4000,
      nullable: true
    }),
    keywords: normalizeSupportKnowledgeList(input.keywords),
    synonyms: normalizeSupportKnowledgeList(input.synonyms),
    requiredContext: normalizeSupportKnowledgeList(input.requiredContext, 30),
    conditions,
    actions: normalizeActions(input.actions),
    status: status as SupportKnowledgeMutation['status'],
    priority: Math.round(numberValue(input.priority, 'Priority', -1000, 1000, 0)),
    confidenceThreshold: numberValue(
      input.confidenceThreshold,
      'Confidence threshold',
      0.2,
      1,
      0.65
    ),
    examples
  };
}
