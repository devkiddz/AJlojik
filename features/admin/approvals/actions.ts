'use server';

import { revalidatePath } from 'next/cache';

import type { AdminApprovalAction, AdminTargetType, Prisma } from '@/lib/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdminPermission } from '@/features/admin/auth/adminPermissions';

export async function requestAdminApproval(input: { action: AdminApprovalAction; targetType: AdminTargetType; targetId: string; reason: string; payload?: Prisma.InputJsonValue }) {
  const access = await requireAdminPermission(input.action === 'DELIVERY_STATUS_UPDATE' ? 'delivery:update:request' : 'deletion:request');
  const request = await prisma.adminApprovalRequest.create({ data: { workspaceId: access.membership.workspaceId, requestedById: access.session.user.id, action: input.action, targetType: input.targetType, targetId: input.targetId, reason: input.reason, payload: input.payload } });
  await prisma.$transaction([
    prisma.adminTodo.create({ data: { workspaceId: access.membership.workspaceId, title: `Approval required: ${input.action.replaceAll('_', ' ')}`, description: input.reason, source: 'APPROVAL', priority: input.action === 'DELETE' ? 'HIGH' : 'MEDIUM', targetType: input.targetType, targetId: input.targetId } }),
    prisma.adminAuditEvent.create({ data: { workspaceId: access.membership.workspaceId, actorId: access.session.user.id, action: 'APPROVAL_REQUESTED', targetType: input.targetType, targetId: input.targetId, summary: input.reason, metadata: { requestId: request.id, approvalAction: input.action } } })
  ]);
  revalidatePath('/admin');
  return request;
}

export async function reviewAdminApproval(formData: FormData) {
  const access = await requireAdminPermission('approval:review');
  const id = String(formData.get('id') ?? '');
  const decision = String(formData.get('decision') ?? '');
  const reviewNote = String(formData.get('reviewNote') ?? '').trim();
  if (!id || !['APPROVED', 'REJECTED'].includes(decision)) throw new Error('A request and valid decision are required.');

  const request = await prisma.adminApprovalRequest.findFirst({
    where: { id, workspaceId: access.membership.workspaceId, status: 'PENDING' }
  });
  if (!request) throw new Error('The approval request is no longer pending.');

  if (
    request.requestedById === access.session.user.id &&
    !access.isDeveloperAdmin
  ) {
    throw new Error('A submission must be reviewed by a different administrator.');
  }

  if (decision === 'APPROVED' && request.action === 'PUBLISH_LIVE') {
    const vendorProfileId =
      request.targetType === 'PRODUCT'
        ? (
            await prisma.product.findFirst({
              where: {
                id: request.targetId,
                workspaceId: access.membership.workspaceId
              },
              select: { vendorProfileId: true }
            })
          )?.vendorProfileId ?? null
        : request.targetType === 'PROMOTION'
          ? (
              await prisma.promotion.findFirst({
                where: {
                  id: request.targetId,
                  workspaceId: access.membership.workspaceId
                },
                select: { vendorProfileId: true }
              })
            )?.vendorProfileId ?? null
          : request.targetType === 'COLLECTION'
            ? (
                await prisma.storeCollection.findFirst({
                  where: {
                    id: request.targetId,
                    workspaceId: access.membership.workspaceId
                  },
                  select: { vendorProfileId: true }
                })
              )?.vendorProfileId ?? null
            : request.targetType === 'CAMPAIGN' ||
                request.targetType === 'EXPERIENCE'
              ? (
                  await prisma.storeStudioCampaign.findFirst({
                    where: {
                      id: request.targetId,
                      workspaceId: access.membership.workspaceId
                    },
                    select: { vendorProfileId: true }
                  })
                )?.vendorProfileId ?? null
              : null;

    if (
      (request.targetType === 'VENDOR' || vendorProfileId) &&
      access.membership.workspace.commerceMode !== 'MULTI_VENDOR'
    ) {
      throw new Error(
        'Developer Admin must activate multivendor mode before vendor records or vendor content can be approved.'
      );
    }

    if (vendorProfileId) {
      const vendor = await prisma.vendorProfile.findFirst({
        where: {
          id: vendorProfileId,
          workspaceId: access.membership.workspaceId,
          status: 'ACTIVE',
          active: true
        },
        select: { id: true }
      });

      if (!vendor) {
        throw new Error(
          'The content owner must be an active approved vendor before this submission can be published.'
        );
      }
    }
  }

  await prisma.$transaction(async tx => {
    let executed = false;
    if (decision === 'APPROVED' && request.action === 'PUBLISH_LIVE') {
      if (request.targetType === 'PRODUCT') {
        await tx.product.update({ where: { id: request.targetId, workspaceId: access.membership.workspaceId }, data: { status: 'PUBLISHED', active: true, approvedAt: new Date() } });
        executed = true;
      } else if (request.targetType === 'PROMOTION') {
        await tx.promotion.update({ where: { id: request.targetId, workspaceId: access.membership.workspaceId }, data: { status: 'PUBLISHED', active: true } });
        executed = true;
      } else if (request.targetType === 'COLLECTION') {
        await tx.storeCollection.update({ where: { id: request.targetId, workspaceId: access.membership.workspaceId }, data: { status: 'PUBLISHED', active: true } });
        executed = true;
      } else if (request.targetType === 'VENDOR') {
        await tx.vendorProfile.update({ where: { id: request.targetId, workspaceId: access.membership.workspaceId }, data: { status: 'ACTIVE', active: true, approvedAt: new Date() } });
        executed = true;
      } else if (request.targetType === 'CAMPAIGN' || request.targetType === 'EXPERIENCE') {
        await tx.storeStudioCampaign.update({ where: { id: request.targetId, workspaceId: access.membership.workspaceId }, data: { status: 'APPROVED', active: true } });
        executed = true;
      } else if (request.targetType === 'SHOPPING_LIST') {
        await tx.shoppingList.update({
          where: {
            id: request.targetId,
            workspaceId: access.membership.workspaceId
          },
          data: {
            visibility: 'SHARED',
            publicationStatus: 'APPROVED',
            publicationReviewedAt: new Date(),
            publicationPublishedAt: new Date(),
            publicationReviewNote: reviewNote || null
          }
        });
        executed = true;
      }
    } else if (decision === 'REJECTED' && request.action === 'PUBLISH_LIVE') {
      if (request.targetType === 'PRODUCT') {
        await tx.product.update({ where: { id: request.targetId, workspaceId: access.membership.workspaceId }, data: { status: 'REJECTED', active: false } });
      } else if (request.targetType === 'PROMOTION') {
        await tx.promotion.update({ where: { id: request.targetId, workspaceId: access.membership.workspaceId }, data: { status: 'REJECTED', active: false } });
      } else if (request.targetType === 'COLLECTION') {
        await tx.storeCollection.update({ where: { id: request.targetId, workspaceId: access.membership.workspaceId }, data: { status: 'REJECTED', active: false } });
      } else if (request.targetType === 'VENDOR') {
        await tx.vendorProfile.update({ where: { id: request.targetId, workspaceId: access.membership.workspaceId }, data: { status: 'REJECTED', active: false } });
      } else if (request.targetType === 'CAMPAIGN' || request.targetType === 'EXPERIENCE') {
        await tx.storeStudioCampaign.update({ where: { id: request.targetId, workspaceId: access.membership.workspaceId }, data: { status: 'REJECTED', active: false } });
      } else if (request.targetType === 'SHOPPING_LIST') {
        await tx.shoppingList.update({
          where: {
            id: request.targetId,
            workspaceId: access.membership.workspaceId
          },
          data: {
            visibility: 'PRIVATE',
            publicationStatus: 'REJECTED',
            publicationReviewedAt: new Date(),
            publicationPublishedAt: null,
            publicationReviewNote: reviewNote || 'The list was not approved for public Store placement.'
          }
        });
      }
    }

    await tx.adminApprovalRequest.update({
      where: { id: request.id },
      data: {
        status: executed ? 'EXECUTED' : decision as 'APPROVED' | 'REJECTED',
        reviewedById: access.session.user.id,
        reviewedAt: new Date(),
        executedAt: executed ? new Date() : null,
        reviewNote: reviewNote || null
      }
    });
    await tx.adminAuditEvent.create({
      data: {
        workspaceId: access.membership.workspaceId,
        actorId: access.session.user.id,
        action: executed ? 'APPROVAL_EXECUTED' : `APPROVAL_${decision}`,
        targetType: request.targetType,
        targetId: request.targetId,
        summary: reviewNote || `${request.action} ${executed ? 'approved and executed' : decision.toLowerCase()}`,
        metadata: { requestId: request.id }
      }
    });
  });

  revalidatePath('/admin');
  revalidatePath('/admin/approvals');
  revalidatePath('/admin/products');
  revalidatePath('/admin/promotions');
  revalidatePath('/admin/collections');
  revalidatePath('/admin/vendors');
  revalidatePath('/admin/store-studio');
  revalidatePath('/vendor/products');
  revalidatePath('/vendor/collections');
  revalidatePath('/vendor/promotions');
  revalidatePath('/vendor/stories');
  revalidatePath('/vendor/reels');
  revalidatePath('/vendor/submissions');
  revalidatePath('/store');
  revalidatePath('/account');
  revalidatePath('/account/lists');
  if (request.targetType === 'SHOPPING_LIST') {
    revalidatePath(`/account/lists/${request.targetId}`);
  }
}
