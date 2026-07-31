import 'server-only';

import { prisma } from '@/lib/prisma';

import type { CommerceModeDowngradeImpact } from '../commerceModeTypes';

const OPEN_APPROVAL_STATUSES = [
  'PENDING',
  'IN_INSPECTION',
  'ON_HOLD',
  'CHANGES_REQUESTED',
  'APPROVED'
] as const;

function activeScheduleWhere(now: Date) {
  return {
    AND: [
      { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
      { OR: [{ endsAt: null }, { endsAt: { gte: now } }] }
    ]
  };
}

export async function getCommerceModeDowngradeImpact(
  workspaceId: string
): Promise<CommerceModeDowngradeImpact> {
  const now = new Date();
  const [
    workspace,
    activeVendors,
    vendorProducts,
    publishedVendorProducts,
    vendorCollections,
    publishedVendorCollections,
    vendorPromotions,
    publishedVendorPromotions,
    vendorCampaigns,
    liveVendorCampaigns,
    openVendorApprovals
  ] = await prisma.$transaction([
    prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { vendorApplicationsOpen: true }
    }),
    prisma.vendorProfile.count({
      where: {
        workspaceId,
        active: true,
        status: 'ACTIVE'
      }
    }),
    prisma.product.count({
      where: {
        workspaceId,
        vendorProfileId: { not: null },
        status: { not: 'ARCHIVED' }
      }
    }),
    prisma.product.count({
      where: {
        workspaceId,
        vendorProfileId: { not: null },
        active: true,
        status: 'PUBLISHED'
      }
    }),
    prisma.storeCollection.count({
      where: {
        workspaceId,
        vendorProfileId: { not: null },
        status: { not: 'ARCHIVED' }
      }
    }),
    prisma.storeCollection.count({
      where: {
        workspaceId,
        vendorProfileId: { not: null },
        active: true,
        status: 'PUBLISHED',
        ...activeScheduleWhere(now)
      }
    }),
    prisma.promotion.count({
      where: {
        workspaceId,
        vendorProfileId: { not: null },
        status: { not: 'ARCHIVED' }
      }
    }),
    prisma.promotion.count({
      where: {
        workspaceId,
        vendorProfileId: { not: null },
        active: true,
        status: 'PUBLISHED',
        ...activeScheduleWhere(now)
      }
    }),
    prisma.storeStudioCampaign.count({
      where: {
        workspaceId,
        vendorProfileId: { not: null },
        status: { notIn: ['EXPIRED', 'REJECTED'] }
      }
    }),
    prisma.storeStudioCampaign.count({
      where: {
        workspaceId,
        vendorProfileId: { not: null },
        active: true,
        status: { in: ['SCHEDULED', 'ACTIVE'] },
        ...activeScheduleWhere(now)
      }
    }),
    prisma.adminApprovalRequest.count({
      where: {
        workspaceId,
        source: 'VENDOR',
        status: { in: [...OPEN_APPROVAL_STATUSES] }
      }
    })
  ]);

  const impact = {
    activeVendors,
    vendorProducts,
    publishedVendorProducts,
    vendorCollections,
    publishedVendorCollections,
    vendorPromotions,
    publishedVendorPromotions,
    vendorCampaigns,
    liveVendorCampaigns,
    openVendorApprovals,
    vendorApplicationsOpen: workspace?.vendorApplicationsOpen ?? false
  };

  return {
    ...impact,
    requiresAcknowledgement:
      impact.activeVendors > 0 ||
      impact.vendorProducts > 0 ||
      impact.vendorCollections > 0 ||
      impact.vendorPromotions > 0 ||
      impact.vendorCampaigns > 0 ||
      impact.openVendorApprovals > 0 ||
      impact.vendorApplicationsOpen
  };
}
