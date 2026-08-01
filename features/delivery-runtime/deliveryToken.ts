import 'server-only';

import {
  createHash,
  randomBytes,
  timingSafeEqual
} from 'node:crypto';

export function createDeliveryToken(
  prefix: 'AJH' | 'AJS'
): string {
  return `${prefix}_${randomBytes(32).toString('base64url')}`;
}

export function hashDeliveryToken(
  token: string
): string {
  return createHash('sha256')
    .update(token)
    .digest('hex');
}

export function deliveryTokenMatches(
  token: string,
  expectedHash: string
): boolean {
  const actual = Buffer.from(
    hashDeliveryToken(token),
    'hex'
  );

  const expected = Buffer.from(
    expectedHash,
    'hex'
  );

  return (
    actual.length === expected.length &&
    timingSafeEqual(actual, expected)
  );
}

export function deliveryTokenExpiry(
  minutes: number
): Date {
  return new Date(
    Date.now() + minutes * 60_000
  );
}
