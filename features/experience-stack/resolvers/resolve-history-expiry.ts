import type { ExperienceHistoryRetention } from '../experienceStackTypes';

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

export function resolveHistoryExpiry(
  retention: ExperienceHistoryRetention,
  now = new Date()
): Date | null {
  switch (retention) {
    case 'SESSION':
      return now;

    case 'ONE_DAY':
      return new Date(now.getTime() + DAY_IN_MILLISECONDS);

    case 'SEVEN_DAYS':
      return new Date(now.getTime() + 7 * DAY_IN_MILLISECONDS);

    case 'THIRTY_DAYS':
      return new Date(now.getTime() + 30 * DAY_IN_MILLISECONDS);

    case 'FOREVER':
      return null;

    default: {
      const exhaustiveCheck: never = retention;
      return exhaustiveCheck;
    }
  }
}