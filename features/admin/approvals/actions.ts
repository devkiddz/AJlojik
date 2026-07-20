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
  const request = await prisma.adminApprovalRequest.update({ where: { id, workspaceId: access.membership.workspaceId, status: 'PENDING' }, data: { status: decision as 'APPROVED' | 'REJECTED', reviewedById: access.session.user.id, reviewedAt: new Date(), reviewNote: reviewNote || null } });
  await prisma.adminAuditEvent.create({ data: { workspaceId: access.membership.workspaceId, actorId: access.session.user.id, action: `APPROVAL_${decision}`, targetType: request.targetType, targetId: request.targetId, summary: reviewNote || `${request.action} ${decision.toLowerCase()}`, metadata: { requestId: request.id } } });
  revalidatePath('/admin');
}
