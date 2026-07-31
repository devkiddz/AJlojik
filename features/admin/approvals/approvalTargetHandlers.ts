import 'server-only';

import type {
  AdminApprovalAction,
  AdminTargetType,
  DeliveryStatus,
  Prisma
} from '@/lib/generated/prisma/client';

type ApprovalRequestTarget = {
  action: AdminApprovalAction;
  targetType: AdminTargetType;
  targetId: string;
  payload: Prisma.JsonValue | null;
};

type SnapshotRecord = Record<string, unknown>;

function jsonRecord(value: unknown): SnapshotRecord {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as SnapshotRecord)
    : {};
}

function jsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function date(value: unknown): Date | null {
  if (!value) return null;
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function stringValue(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}


function enumValue<T extends string>(
  value: unknown,
  allowed: readonly T[],
  label: string
): T {
  const normalized = stringValue(value);
  if (!normalized || !allowed.includes(normalized as T)) {
    throw new Error(`The stored ${label} snapshot is invalid and cannot be reverted safely.`);
  }
  return normalized as T;
}

function deliveryStatus(value: unknown): DeliveryStatus | null {
  const statuses: DeliveryStatus[] = [
    'PENDING',
    'ASSIGNED',
    'BARCODE_SCANNED',
    'PICKED_UP',
    'IN_TRANSIT',
    'ARRIVED',
    'DELIVERED',
    'FAILED',
    'CANCELLED'
  ];

  return typeof value === 'string' &&
    statuses.includes(value as DeliveryStatus)
    ? (value as DeliveryStatus)
    : null;
}

export async function captureApprovalTargetSnapshot(
  transaction: Prisma.TransactionClient,
  input: {
    workspaceId: string;
    targetType: AdminTargetType;
    targetId: string;
  }
): Promise<Prisma.InputJsonValue | null> {
  if (input.targetType === 'PRODUCT') {
    const target = await transaction.product.findFirst({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      select: {
        status: true,
        active: true,
        submittedAt: true,
        approvedAt: true
      }
    });
    return target ? jsonValue(target) : null;
  }

  if (input.targetType === 'PROMOTION') {
    const target = await transaction.promotion.findFirst({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      select: {
        status: true,
        active: true,
        startsAt: true,
        endsAt: true
      }
    });
    return target ? jsonValue(target) : null;
  }

  if (input.targetType === 'COLLECTION') {
    const target = await transaction.storeCollection.findFirst({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      select: {
        status: true,
        active: true,
        startsAt: true,
        endsAt: true
      }
    });
    return target ? jsonValue(target) : null;
  }

  if (
    input.targetType === 'CAMPAIGN' ||
    input.targetType === 'EXPERIENCE'
  ) {
    const target = await transaction.storeStudioCampaign.findFirst({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      select: {
        status: true,
        active: true,
        startsAt: true,
        endsAt: true
      }
    });
    return target ? jsonValue(target) : null;
  }

  if (input.targetType === 'VENDOR') {
    const target = await transaction.vendorProfile.findFirst({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      select: {
        status: true,
        active: true,
        approvedAt: true,
        suspendedAt: true
      }
    });
    return target ? jsonValue(target) : null;
  }

  if (input.targetType === 'SHOPPING_LIST') {
    const target = await transaction.shoppingList.findFirst({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      select: {
        visibility: true,
        status: true,
        publicationStatus: true,
        publicationReviewedAt: true,
        publicationPublishedAt: true,
        publicationReviewNote: true
      }
    });
    return target ? jsonValue(target) : null;
  }

  if (input.targetType === 'MEDIA') {
    const target = await transaction.mediaAsset.findFirst({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      select: {
        status: true
      }
    });
    return target ? jsonValue(target) : null;
  }

  if (input.targetType === 'ORDER') {
    const target = await transaction.order.findFirst({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      select: {
        status: true,
        paymentStatus: true
      }
    });
    return target ? jsonValue(target) : null;
  }

  if (input.targetType === 'DELIVERY') {
    const target = await transaction.delivery.findFirst({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      select: {
        status: true,
        trackingEnabled: true,
        estimatedArrival: true,
        pickedUpAt: true,
        deliveredAt: true
      }
    });
    return target ? jsonValue(target) : null;
  }

  return null;
}

export async function executeApprovalTarget(
  transaction: Prisma.TransactionClient,
  input: {
    workspaceId: string;
    actorId: string;
    request: ApprovalRequestTarget;
    reviewNote?: string | null;
  }
): Promise<{
  executed: boolean;
  result: Prisma.InputJsonValue | null;
}> {
  const { request } = input;
  const now = new Date();

  if (request.action === 'PUBLISH_LIVE') {
    if (request.targetType === 'PRODUCT') {
      const result = await transaction.product.update({
        where: {
          id: request.targetId,
          workspaceId: input.workspaceId
        },
        data: {
          status: 'PUBLISHED',
          active: true,
          approvedAt: now
        },
        select: {
          id: true,
          status: true,
          active: true,
          approvedAt: true
        }
      });
      return { executed: true, result: jsonValue(result) };
    }

    if (request.targetType === 'PROMOTION') {
      const result = await transaction.promotion.update({
        where: {
          id: request.targetId,
          workspaceId: input.workspaceId
        },
        data: {
          status: 'PUBLISHED',
          active: true
        },
        select: {
          id: true,
          status: true,
          active: true
        }
      });
      return { executed: true, result: jsonValue(result) };
    }

    if (request.targetType === 'COLLECTION') {
      const result = await transaction.storeCollection.update({
        where: {
          id: request.targetId,
          workspaceId: input.workspaceId
        },
        data: {
          status: 'PUBLISHED',
          active: true
        },
        select: {
          id: true,
          status: true,
          active: true
        }
      });
      return { executed: true, result: jsonValue(result) };
    }

    if (
      request.targetType === 'CAMPAIGN' ||
      request.targetType === 'EXPERIENCE'
    ) {
      const campaign = await transaction.storeStudioCampaign.findFirst({
        where: {
          id: request.targetId,
          workspaceId: input.workspaceId
        },
        select: {
          id: true,
          startsAt: true,
          endsAt: true
        }
      });

      if (!campaign) {
        throw new Error('The Store Studio campaign no longer exists.');
      }

      if (campaign.endsAt && campaign.endsAt <= now) {
        throw new Error(
          'The campaign schedule has already ended. Edit the deadline before approval.'
        );
      }

      const status =
        campaign.startsAt && campaign.startsAt > now
          ? 'SCHEDULED'
          : 'ACTIVE';

      const result = await transaction.storeStudioCampaign.update({
        where: {
          id: campaign.id
        },
        data: {
          status,
          active: true,
          startsAt:
            status === 'ACTIVE'
              ? campaign.startsAt ?? now
              : campaign.startsAt
        },
        select: {
          id: true,
          status: true,
          active: true,
          startsAt: true,
          endsAt: true
        }
      });

      return { executed: true, result: jsonValue(result) };
    }

    if (request.targetType === 'VENDOR') {
      const result = await transaction.vendorProfile.update({
        where: {
          id: request.targetId,
          workspaceId: input.workspaceId
        },
        data: {
          status: 'ACTIVE',
          active: true,
          approvedAt: now,
          suspendedAt: null
        },
        select: {
          id: true,
          status: true,
          active: true,
          approvedAt: true
        }
      });
      return { executed: true, result: jsonValue(result) };
    }

    if (request.targetType === 'SHOPPING_LIST') {
      const result = await transaction.shoppingList.update({
        where: {
          id: request.targetId,
          workspaceId: input.workspaceId
        },
        data: {
          visibility: 'SHARED',
          publicationStatus: 'APPROVED',
          publicationReviewedAt: now,
          publicationPublishedAt: now,
          publicationReviewNote: input.reviewNote?.trim() || null
        },
        select: {
          id: true,
          userId: true,
          name: true,
          visibility: true,
          publicationStatus: true,
          publicationPublishedAt: true
        }
      });
      return { executed: true, result: jsonValue(result) };
    }

    if (request.targetType === 'MEDIA') {
      const result = await transaction.mediaAsset.update({
        where: {
          id: request.targetId,
          workspaceId: input.workspaceId
        },
        data: {
          status: 'ACTIVE'
        },
        select: {
          id: true,
          status: true
        }
      });
      return { executed: true, result: jsonValue(result) };
    }
  }

  if (request.action === 'DELETE') {
    if (request.targetType === 'PRODUCT') {
      const result = await transaction.product.update({
        where: {
          id: request.targetId,
          workspaceId: input.workspaceId
        },
        data: {
          status: 'ARCHIVED',
          active: false
        },
        select: {
          id: true,
          status: true,
          active: true
        }
      });
      return { executed: true, result: jsonValue(result) };
    }

    if (request.targetType === 'PROMOTION') {
      const result = await transaction.promotion.update({
        where: {
          id: request.targetId,
          workspaceId: input.workspaceId
        },
        data: {
          status: 'ARCHIVED',
          active: false
        },
        select: {
          id: true,
          status: true,
          active: true
        }
      });
      return { executed: true, result: jsonValue(result) };
    }

    if (request.targetType === 'COLLECTION') {
      const result = await transaction.storeCollection.update({
        where: {
          id: request.targetId,
          workspaceId: input.workspaceId
        },
        data: {
          status: 'ARCHIVED',
          active: false
        },
        select: {
          id: true,
          status: true,
          active: true
        }
      });
      return { executed: true, result: jsonValue(result) };
    }

    if (
      request.targetType === 'CAMPAIGN' ||
      request.targetType === 'EXPERIENCE'
    ) {
      const result = await transaction.storeStudioCampaign.update({
        where: {
          id: request.targetId,
          workspaceId: input.workspaceId
        },
        data: {
          status: 'EXPIRED',
          active: false,
          endsAt: now
        },
        select: {
          id: true,
          status: true,
          active: true,
          endsAt: true
        }
      });
      return { executed: true, result: jsonValue(result) };
    }

    if (request.targetType === 'MEDIA') {
      const result = await transaction.mediaAsset.update({
        where: {
          id: request.targetId,
          workspaceId: input.workspaceId
        },
        data: {
          status: 'ARCHIVED'
        },
        select: {
          id: true,
          status: true
        }
      });
      return { executed: true, result: jsonValue(result) };
    }

    if (request.targetType === 'SHOPPING_LIST') {
      const result = await transaction.shoppingList.update({
        where: {
          id: request.targetId,
          workspaceId: input.workspaceId
        },
        data: {
          status: 'ARCHIVED',
          visibility: 'PRIVATE'
        },
        select: {
          id: true,
          status: true,
          visibility: true
        }
      });
      return { executed: true, result: jsonValue(result) };
    }
  }

  if (
    request.action === 'DELIVERY_STATUS_UPDATE' ||
    request.action === 'DELIVERY_EXCEPTION'
  ) {
    if (request.targetType !== 'DELIVERY') {
      throw new Error('Delivery operations require a Delivery target.');
    }

    const payload = jsonRecord(request.payload);
    const nextStatus =
      request.action === 'DELIVERY_EXCEPTION'
        ? 'FAILED'
        : deliveryStatus(payload.nextStatus ?? payload.status);

    if (!nextStatus) {
      throw new Error(
        'The approval request does not contain a valid delivery status.'
      );
    }

    const result = await transaction.delivery.update({
      where: {
        id: request.targetId,
        workspaceId: input.workspaceId
      },
      data: {
        status: nextStatus,
        pickedUpAt:
          nextStatus === 'PICKED_UP'
            ? now
            : undefined,
        deliveredAt:
          nextStatus === 'DELIVERED'
            ? now
            : nextStatus === 'CANCELLED' || nextStatus === 'FAILED'
              ? null
              : undefined
      },
      select: {
        id: true,
        status: true,
        pickedUpAt: true,
        deliveredAt: true
      }
    });

    await transaction.deliveryTrackingEvent.create({
      data: {
        deliveryId: result.id,
        actorId: input.actorId,
        status: result.status,
        source: 'APPROVAL',
        note: input.reviewNote?.trim() || null,
        metadata: {
          approvalAction: request.action
        }
      }
    });

    return { executed: true, result: jsonValue(result) };
  }

  return {
    executed: false,
    result: null
  };
}

export async function pauseApprovalTarget(
  transaction: Prisma.TransactionClient,
  input: {
    workspaceId: string;
    targetType: AdminTargetType;
    targetId: string;
  }
): Promise<boolean> {
  if (input.targetType === 'PRODUCT') {
    await transaction.product.update({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      data: {
        status: 'PAUSED',
        active: false
      }
    });
    return true;
  }

  if (input.targetType === 'PROMOTION') {
    await transaction.promotion.update({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      data: {
        status: 'PAUSED',
        active: false
      }
    });
    return true;
  }

  if (input.targetType === 'COLLECTION') {
    await transaction.storeCollection.update({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      data: {
        status: 'PAUSED',
        active: false
      }
    });
    return true;
  }

  if (
    input.targetType === 'CAMPAIGN' ||
    input.targetType === 'EXPERIENCE'
  ) {
    await transaction.storeStudioCampaign.update({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      data: {
        status: 'PAUSED',
        active: false
      }
    });
    return true;
  }

  if (input.targetType === 'VENDOR') {
    await transaction.vendorProfile.update({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      data: {
        status: 'SUSPENDED',
        active: false,
        suspendedAt: new Date()
      }
    });
    return true;
  }

  if (input.targetType === 'SHOPPING_LIST') {
    await transaction.shoppingList.update({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      data: {
        visibility: 'PRIVATE'
      }
    });
    return true;
  }

  if (input.targetType === 'MEDIA') {
    await transaction.mediaAsset.update({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      data: {
        status: 'ARCHIVED'
      }
    });
    return true;
  }

  return false;
}

export async function reactivateApprovalTarget(
  transaction: Prisma.TransactionClient,
  input: {
    workspaceId: string;
    targetType: AdminTargetType;
    targetId: string;
  }
): Promise<boolean> {
  const now = new Date();

  if (input.targetType === 'PRODUCT') {
    await transaction.product.update({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      data: {
        status: 'PUBLISHED',
        active: true
      }
    });
    return true;
  }

  if (input.targetType === 'PROMOTION') {
    await transaction.promotion.update({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      data: {
        status: 'PUBLISHED',
        active: true
      }
    });
    return true;
  }

  if (input.targetType === 'COLLECTION') {
    await transaction.storeCollection.update({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      data: {
        status: 'PUBLISHED',
        active: true
      }
    });
    return true;
  }

  if (
    input.targetType === 'CAMPAIGN' ||
    input.targetType === 'EXPERIENCE'
  ) {
    const campaign = await transaction.storeStudioCampaign.findFirst({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      select: {
        id: true,
        startsAt: true,
        endsAt: true
      }
    });

    if (!campaign) return false;

    if (campaign.endsAt && campaign.endsAt <= now) {
      throw new Error(
        'The campaign has expired. Edit its schedule before reactivation.'
      );
    }

    await transaction.storeStudioCampaign.update({
      where: {
        id: campaign.id
      },
      data: {
        active: true,
        status:
          campaign.startsAt && campaign.startsAt > now
            ? 'SCHEDULED'
            : 'ACTIVE',
        startsAt: campaign.startsAt ?? now
      }
    });
    return true;
  }

  if (input.targetType === 'VENDOR') {
    await transaction.vendorProfile.update({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      data: {
        status: 'ACTIVE',
        active: true,
        suspendedAt: null
      }
    });
    return true;
  }

  if (input.targetType === 'SHOPPING_LIST') {
    const list = await transaction.shoppingList.findFirst({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      select: {
        publicationStatus: true
      }
    });

    await transaction.shoppingList.update({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      data: {
        visibility:
          list?.publicationStatus === 'APPROVED'
            ? 'SHARED'
            : 'PRIVATE'
      }
    });
    return true;
  }

  if (input.targetType === 'MEDIA') {
    await transaction.mediaAsset.update({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      data: {
        status: 'ACTIVE'
      }
    });
    return true;
  }

  return false;
}

export async function requestChangesForApprovalTarget(
  transaction: Prisma.TransactionClient,
  input: {
    workspaceId: string;
    targetType: AdminTargetType;
    targetId: string;
    note: string | null;
  }
): Promise<boolean> {
  if (input.targetType === 'PRODUCT') {
    await transaction.product.update({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      data: {
        status: 'REJECTED',
        active: false
      }
    });
    return true;
  }

  if (input.targetType === 'PROMOTION') {
    await transaction.promotion.update({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      data: {
        status: 'REJECTED',
        active: false
      }
    });
    return true;
  }

  if (input.targetType === 'COLLECTION') {
    await transaction.storeCollection.update({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      data: {
        status: 'REJECTED',
        active: false
      }
    });
    return true;
  }

  if (
    input.targetType === 'CAMPAIGN' ||
    input.targetType === 'EXPERIENCE'
  ) {
    await transaction.storeStudioCampaign.update({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      data: {
        status: 'REJECTED',
        active: false
      }
    });
    return true;
  }

  if (input.targetType === 'VENDOR') {
    await transaction.vendorProfile.update({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      data: {
        status: 'REJECTED',
        active: false
      }
    });
    return true;
  }

  if (input.targetType === 'SHOPPING_LIST') {
    await transaction.shoppingList.update({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      data: {
        visibility: 'PRIVATE',
        publicationStatus: 'REJECTED',
        publicationReviewedAt: new Date(),
        publicationReviewNote: input.note
      }
    });
    return true;
  }

  return false;
}

export async function revertApprovalTarget(
  transaction: Prisma.TransactionClient,
  input: {
    workspaceId: string;
    targetType: AdminTargetType;
    targetId: string;
    snapshot: Prisma.JsonValue | null;
  }
): Promise<boolean> {
  const snapshot = jsonRecord(input.snapshot);

  if (!Object.keys(snapshot).length) {
    throw new Error(
      'This request has no execution snapshot and cannot be reverted safely.'
    );
  }

  if (input.targetType === 'PRODUCT') {
    await transaction.product.update({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      data: {
        status: enumValue(
          snapshot.status,
          ['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'PAUSED', 'REJECTED', 'ARCHIVED'] as const,
          'product status'
        ),
        active: Boolean(snapshot.active),
        submittedAt: date(snapshot.submittedAt),
        approvedAt: date(snapshot.approvedAt)
      }
    });
    return true;
  }

  if (input.targetType === 'PROMOTION') {
    await transaction.promotion.update({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      data: {
        status: enumValue(
          snapshot.status,
          ['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'PAUSED', 'EXPIRED', 'REJECTED', 'ARCHIVED'] as const,
          'promotion status'
        ),
        active: Boolean(snapshot.active),
        startsAt: date(snapshot.startsAt),
        endsAt: date(snapshot.endsAt)
      }
    });
    return true;
  }

  if (input.targetType === 'COLLECTION') {
    await transaction.storeCollection.update({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      data: {
        status: enumValue(
          snapshot.status,
          ['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'PAUSED', 'REJECTED', 'ARCHIVED'] as const,
          'collection status'
        ),
        active: Boolean(snapshot.active),
        startsAt: date(snapshot.startsAt),
        endsAt: date(snapshot.endsAt)
      }
    });
    return true;
  }

  if (
    input.targetType === 'CAMPAIGN' ||
    input.targetType === 'EXPERIENCE'
  ) {
    await transaction.storeStudioCampaign.update({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      data: {
        status: enumValue(
          snapshot.status,
          ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'EXPIRED', 'REJECTED'] as const,
          'campaign status'
        ),
        active: Boolean(snapshot.active),
        startsAt: date(snapshot.startsAt),
        endsAt: date(snapshot.endsAt)
      }
    });
    return true;
  }

  if (input.targetType === 'VENDOR') {
    await transaction.vendorProfile.update({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      data: {
        status: enumValue(
          snapshot.status,
          ['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED', 'ARCHIVED'] as const,
          'vendor status'
        ),
        active: Boolean(snapshot.active),
        approvedAt: date(snapshot.approvedAt),
        suspendedAt: date(snapshot.suspendedAt)
      }
    });
    return true;
  }

  if (input.targetType === 'SHOPPING_LIST') {
    await transaction.shoppingList.update({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      data: {
        visibility: enumValue(snapshot.visibility, ['PRIVATE', 'SHARED'] as const, 'shopping-list visibility'),
        status: enumValue(snapshot.status, ['ACTIVE', 'ARCHIVED'] as const, 'shopping-list status'),
        publicationStatus: enumValue(
          snapshot.publicationStatus,
          ['PRIVATE', 'PENDING_REVIEW', 'APPROVED', 'REJECTED'] as const,
          'shopping-list publication status'
        ),
        publicationReviewedAt: date(snapshot.publicationReviewedAt),
        publicationPublishedAt: date(snapshot.publicationPublishedAt),
        publicationReviewNote: stringValue(snapshot.publicationReviewNote)
      }
    });
    return true;
  }

  if (input.targetType === 'MEDIA') {
    await transaction.mediaAsset.update({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      data: {
        status: enumValue(
          snapshot.status,
          ['ACTIVE', 'ARCHIVED', 'DELETED'] as const,
          'media status'
        )
      }
    });
    return true;
  }

  if (input.targetType === 'ORDER') {
    await transaction.order.update({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      data: {
        status: enumValue(
          snapshot.status,
          ['PENDING', 'CONFIRMED', 'PROCESSING', 'READY', 'DISPATCHED', 'DELIVERED', 'CANCELLED', 'REFUNDED'] as const,
          'order status'
        ),
        paymentStatus: enumValue(
          snapshot.paymentStatus,
          ['PENDING', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDED'] as const,
          'payment status'
        )
      }
    });
    return true;
  }

  if (input.targetType === 'DELIVERY') {
    await transaction.delivery.update({
      where: {
        id: input.targetId,
        workspaceId: input.workspaceId
      },
      data: {
        status: enumValue(snapshot.status, ['PENDING', 'ASSIGNED', 'BARCODE_SCANNED', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED', 'DELIVERED', 'FAILED', 'CANCELLED'] as const, 'delivery status'),
        trackingEnabled: Boolean(snapshot.trackingEnabled),
        estimatedArrival: date(snapshot.estimatedArrival),
        pickedUpAt: date(snapshot.pickedUpAt),
        deliveredAt: date(snapshot.deliveredAt)
      }
    });
    return true;
  }

  return false;
}
