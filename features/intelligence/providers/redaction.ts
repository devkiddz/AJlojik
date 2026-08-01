const SECRET_KEYS = /password|secret|token|authorization|cookie|session|api[-_]?key|card|cvv/i;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_PATTERN = /(?:\+?234|0)[789][01]\d{8}/g;

export function redactIntelligenceValue(value: unknown, depth = 0): unknown {
  if (depth > 8) return '[DEPTH_LIMIT]';
  if (typeof value === 'string') {
    return value.replace(EMAIL_PATTERN, '[EMAIL_REDACTED]').replace(PHONE_PATTERN, '[PHONE_REDACTED]').slice(0, 12000);
  }
  if (Array.isArray(value)) return value.slice(0, 200).map(item => redactIntelligenceValue(item, depth + 1));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, child]) => [
      key,
      SECRET_KEYS.test(key) ? '[REDACTED]' : redactIntelligenceValue(child, depth + 1)
    ]));
  }
  return value;
}
