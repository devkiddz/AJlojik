import type { DeliveryStatus } from '@/lib/generated/prisma/client';

const transitions: Record<
  DeliveryStatus,
  readonly DeliveryStatus[]
> = {
  PENDING: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['BARCODE_SCANNED', 'CANCELLED'],
  BARCODE_SCANNED: ['PICKED_UP', 'FAILED', 'CANCELLED'],
  PICKED_UP: ['IN_TRANSIT', 'FAILED'],
  IN_TRANSIT: ['ARRIVED', 'FAILED'],
  ARRIVED: ['DELIVERED', 'FAILED'],
  DELIVERED: [],
  FAILED: ['ASSIGNED', 'CANCELLED'],
  CANCELLED: []
};

export function assertDeliveryTransition(
  current: DeliveryStatus,
  next: DeliveryStatus
): void {
  if (current === next) {
    return;
  }

  if (!transitions[current].includes(next)) {
    throw new Error(
      `Delivery cannot move directly from ${current.replaceAll('_', ' ')} to ${next.replaceAll('_', ' ')}.`
    );
  }
}

export function activeDeliveryStatus(
  status: DeliveryStatus
): boolean {
  return ![
    'DELIVERED',
    'FAILED',
    'CANCELLED'
  ].includes(status);
}
