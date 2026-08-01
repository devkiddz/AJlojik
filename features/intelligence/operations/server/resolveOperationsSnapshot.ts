import 'server-only';

import type {
  AssistantAccess
} from '@/features/ai-assistance/server/assistantAccess';

import {
  prisma
} from '@/lib/prisma';

import type {
  IntelligenceOperationSignal,
  IntelligenceOperationsSnapshot
} from '../operationContracts';

export async function resolveOperationsSnapshot(
  access:
    AssistantAccess
): Promise<IntelligenceOperationsSnapshot> {
  if (
    access.audience ===
    'customer'
  ) {
    throw new Error(
      'Operational Intelligence is available only to Admin and Vendor workspaces.'
    );
  }

  return access.audience ===
    'admin'
      ? resolveAdminSnapshot(
          access
        )
      : resolveVendorSnapshot(
          access
        );
}

async function resolveAdminSnapshot(
  access:
    AssistantAccess
): Promise<IntelligenceOperationsSnapshot> {
  const [
    draftProducts,
    pendingProducts,
    inventoryRows,
    pendingReviews,
    approvalQueue,
    campaignQueue,
    vendorQueue
  ] =
    await Promise.all([
      prisma.product.count({
        where: {
          workspaceId:
            access.workspaceId,
          status:
            'DRAFT'
        }
      }),
      prisma.product.count({
        where: {
          workspaceId:
            access.workspaceId,
          status:
            'PENDING_REVIEW'
        }
      }),
      prisma.inventory.findMany({
        where: {
          variant: {
            product: {
              workspaceId:
                access.workspaceId,
              active:
                true
            }
          }
        },
        select: {
          quantity:
            true,
          reserved:
            true,
          reorderLevel:
            true
        },
        take:
          500
      }),
      prisma.review.count({
        where: {
          status:
            'PENDING',
          product: {
            workspaceId:
              access.workspaceId
          }
        }
      }),
      prisma.adminApprovalRequest.count({
        where: {
          workspaceId:
            access.workspaceId,
          status: {
            in: [
              'PENDING',
              'IN_INSPECTION',
              'ON_HOLD',
              'CHANGES_REQUESTED'
            ]
          }
        }
      }),
      prisma.storeStudioCampaign.count({
        where: {
          workspaceId:
            access.workspaceId,
          status: {
            in: [
              'DRAFT',
              'PENDING_REVIEW',
              'APPROVED',
              'SCHEDULED'
            ]
          },
          active:
            true
        }
      }),
      prisma.vendorProfile.count({
        where: {
          workspaceId:
            access.workspaceId,
          status: {
            in: [
              'PENDING',
              'SUSPENDED'
            ]
          }
        }
      })
    ]);

  const lowStock =
    inventoryRows.filter(
      row =>
        row.quantity -
          row.reserved <=
        row.reorderLevel
    ).length;

  const catalogueWork =
    draftProducts +
    pendingProducts;

  const signals:
    IntelligenceOperationSignal[] = [
    signal({
      id:
        'admin-catalogue',
      title:
        'Catalogue quality',
      description:
        'Draft and pending-review products that need completion, correction or governance.',
      count:
        catalogueWork,
      href:
        '/admin/products',
      tone:
        catalogueWork
          ? 'attention'
          : 'positive',
      resolutionType:
        'CATALOG_IMPROVEMENT',
      resolutionTitle:
        'Resolve catalogue quality work',
      resolutionObjective:
        'Inspect incomplete and pending catalogue records, prioritize corrections and prepare governed actions.',
      expectedOutcome:
        'A reviewed catalogue improvement plan linked to the affected products.'
    }),
    signal({
      id:
        'admin-inventory',
      title:
        'Inventory risks',
      description:
        'Active variants at or below their reorder threshold after reservations.',
      count:
        lowStock,
      href:
        '/admin/inventory',
      tone:
        lowStock
          ? 'critical'
          : 'positive',
      resolutionType:
        'INVENTORY_INTERVENTION',
      resolutionTitle:
        'Resolve inventory risks',
      resolutionObjective:
        'Review low-stock variants, identify commercial impact and prepare safe inventory interventions.',
      expectedOutcome:
        'A prioritized inventory recovery plan ready for operational approval.'
    }),
    signal({
      id:
        'admin-reviews',
      title:
        'Review moderation',
      description:
        'Customer reviews waiting for moderation.',
      count:
        pendingReviews,
      href:
        '/admin/approvals',
      tone:
        pendingReviews
          ? 'attention'
          : 'positive',
      resolutionType:
        'REVIEW_MODERATION',
      resolutionTitle:
        'Resolve the review queue',
      resolutionObjective:
        'Inspect pending reviews, identify moderation risk and prepare governed moderation recommendations.',
      expectedOutcome:
        'A defensible moderation plan with clear decisions and reasons.'
    }),
    signal({
      id:
        'admin-approvals',
      title:
        'Approval operations',
      description:
        'Requests currently pending, under inspection, held or awaiting changes.',
      count:
        approvalQueue,
      href:
        '/admin/approvals',
      tone:
        approvalQueue
          ? 'attention'
          : 'positive',
      resolutionType:
        'OPERATIONS_BRIEF',
      resolutionTitle:
        'Prioritize the approval queue',
      resolutionObjective:
        'Assess active approval requests, identify urgency and prepare the correct review sequence.',
      expectedOutcome:
        'A prioritized approval brief linked to the current queue.'
    }),
    signal({
      id:
        'admin-store-studio',
      title:
        'Store Studio',
      description:
        'Draft, pending, approved or scheduled campaigns requiring operational attention.',
      count:
        campaignQueue,
      href:
        '/admin/store-studio',
      tone:
        campaignQueue
          ? 'neutral'
          : 'positive',
      resolutionType:
        'CAMPAIGN_PLAN',
      resolutionTitle:
        'Coordinate Store Studio campaigns',
      resolutionObjective:
        'Review campaign readiness, placement, timing and governance across the active Store Studio queue.',
      expectedOutcome:
        'A coordinated campaign plan ready for review or activation.'
    }),
    signal({
      id:
        'admin-vendors',
      title:
        'Vendor oversight',
      description:
        'Vendor profiles pending activation or currently suspended.',
      count:
        vendorQueue,
      href:
        '/admin/vendors',
      tone:
        vendorQueue
          ? 'critical'
          : 'positive',
      resolutionType:
        'VENDOR_INTERVENTION',
      resolutionTitle:
        'Resolve vendor oversight cases',
      resolutionObjective:
        'Inspect pending and suspended vendors, identify required interventions and prepare governed next actions.',
      expectedOutcome:
        'A vendor oversight plan with clear ownership and approval requirements.'
    })
  ];

  return {
    audience:
      'admin',
    capturedAt:
      new Date().toISOString(),
    headline:
      'Workspace operations',
    summary:
      summarize(
        signals
      ),
    signals
  };
}

async function resolveVendorSnapshot(
  access:
    AssistantAccess
): Promise<IntelligenceOperationsSnapshot> {
  if (
    !access.vendorProfileId
  ) {
    throw new Error(
      'An active vendor profile is required.'
    );
  }

  const [
    draftProducts,
    pendingProducts,
    pendingPromotions,
    campaignQueue,
    submissions
  ] =
    await Promise.all([
      prisma.product.count({
        where: {
          workspaceId:
            access.workspaceId,
          vendorProfileId:
            access.vendorProfileId,
          status:
            'DRAFT'
        }
      }),
      prisma.product.count({
        where: {
          workspaceId:
            access.workspaceId,
          vendorProfileId:
            access.vendorProfileId,
          status:
            'PENDING_REVIEW'
        }
      }),
      prisma.promotion.count({
        where: {
          workspaceId:
            access.workspaceId,
          vendorProfileId:
            access.vendorProfileId,
          status:
            'PENDING_REVIEW'
        }
      }),
      prisma.storeStudioCampaign.count({
        where: {
          workspaceId:
            access.workspaceId,
          vendorProfileId:
            access.vendorProfileId,
          status: {
            in: [
              'DRAFT',
              'PENDING_REVIEW',
              'APPROVED',
              'SCHEDULED'
            ]
          },
          active:
            true
        }
      }),
      prisma.adminApprovalRequest.count({
        where: {
          workspaceId:
            access.workspaceId,
          source:
            'VENDOR',
          requestedById:
            access.userId,
          status: {
            in: [
              'PENDING',
              'IN_INSPECTION',
              'ON_HOLD',
              'CHANGES_REQUESTED'
            ]
          }
        }
      })
    ]);

  const signals:
    IntelligenceOperationSignal[] = [
    signal({
      id:
        'vendor-drafts',
      title:
        'Product drafts',
      description:
        'Vendor products still being prepared before submission.',
      count:
        draftProducts,
      href:
        '/vendor/products',
      tone:
        draftProducts
          ? 'neutral'
          : 'positive',
      resolutionType:
        'PRODUCT_DRAFT',
      resolutionTitle:
        'Complete vendor product drafts',
      resolutionObjective:
        'Inspect current draft products, resolve incomplete catalogue fields and prepare submission-ready drafts.',
      expectedOutcome:
        'Complete product drafts ready for vendor review and submission.'
    }),
    signal({
      id:
        'vendor-revisions',
      title:
        'Product submissions',
      description:
        'Products currently awaiting workspace review.',
      count:
        pendingProducts,
      href:
        '/vendor/submissions',
      tone:
        pendingProducts
          ? 'attention'
          : 'positive',
      resolutionType:
        'PRODUCT_REVISION',
      resolutionTitle:
        'Review product submissions',
      resolutionObjective:
        'Assess pending product submissions and prepare any corrections or follow-up required by governance.',
      expectedOutcome:
        'A clear submission follow-up plan linked to affected products.'
    }),
    signal({
      id:
        'vendor-promotions',
      title:
        'Promotion approvals',
      description:
        'Vendor promotions currently waiting for workspace review.',
      count:
        pendingPromotions,
      href:
        '/vendor/promotions',
      tone:
        pendingPromotions
          ? 'attention'
          : 'positive',
      resolutionType:
        'CAMPAIGN_PLAN',
      resolutionTitle:
        'Resolve promotion submissions',
      resolutionObjective:
        'Review pending promotion submissions, validate product readiness and prepare the next governed action.',
      expectedOutcome:
        'Promotion submissions ready for approval follow-up or correction.'
    }),
    signal({
      id:
        'vendor-campaigns',
      title:
        'Campaign Studio',
      description:
        'Active vendor campaign drafts and scheduled submissions.',
      count:
        campaignQueue,
      href:
        '/vendor/promotions',
      tone:
        campaignQueue
          ? 'neutral'
          : 'positive',
      resolutionType:
        'CAMPAIGN_PLAN',
      resolutionTitle:
        'Coordinate vendor campaigns',
      resolutionObjective:
        'Review active campaign work, timing, products and submission readiness.',
      expectedOutcome:
        'A coordinated vendor campaign plan ready for submission.'
    }),
    signal({
      id:
        'vendor-submissions',
      title:
        'Governance queue',
      description:
        'Vendor-originated approval requests still in progress.',
      count:
        submissions,
      href:
        '/vendor/submissions',
      tone:
        submissions
          ? 'attention'
          : 'positive',
      resolutionType:
        'GOVERNANCE_EXPLANATION',
      resolutionTitle:
        'Understand active submissions',
      resolutionObjective:
        'Explain the current state of active vendor submissions and identify the correct next step for each.',
      expectedOutcome:
        'A clear governed follow-up path for every active submission.'
    })
  ];

  return {
    audience:
      'vendor',
    capturedAt:
      new Date().toISOString(),
    headline:
      'Vendor operations',
    summary:
      summarize(
        signals
      ),
    signals
  };
}

function signal(
  value:
    IntelligenceOperationSignal
): IntelligenceOperationSignal {
  return value;
}

function summarize(
  signals:
    IntelligenceOperationSignal[]
): string {
  const total =
    signals.reduce(
      (
        sum,
        item
      ) =>
        sum +
        item.count,
      0
    );

  if (!total) {
    return 'No active operational pressure was detected in the connected areas.';
  }

  const highest =
    [...signals].sort(
      (
        left,
        right
      ) =>
        right.count -
        left.count
    )[0];

  return `${total} active operational items were detected. ${highest.title} currently carries the largest queue.`;
}
