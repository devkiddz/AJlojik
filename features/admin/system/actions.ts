'use server';

import { revalidatePath } from 'next/cache';

import { requireDeveloperAdmin } from '@/features/admin/auth/adminPermissions';
import { prisma } from '@/lib/prisma';

export async function updateWorkspaceCommerceMode(formData: FormData) {
  const access = await requireDeveloperAdmin();
  const workspaceId = String(formData.get('workspaceId') ?? '').trim();
  const mode = String(formData.get('commerceMode') ?? '').trim();

  if (!workspaceId || !['SINGLE_VENDOR', 'MULTI_VENDOR'].includes(mode)) {
    throw new Error('Workspace and commerce mode are required.');
  }

  const current = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true, name: true, commerceMode: true }
  });

  if (!current) {
    throw new Error('The selected workspace no longer exists.');
  }

  if (current.commerceMode === mode) {
    return;
  }

  await prisma.$transaction([
    prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        commerceMode: mode as 'SINGLE_VENDOR' | 'MULTI_VENDOR',
        ...(mode === 'SINGLE_VENDOR'
          ? { vendorApplicationsOpen: false }
          : {})
      }
    }),
    prisma.adminAuditEvent.create({
      data: {
        workspaceId,
        actorId: access.session.user.id,
        action: 'COMMERCE_MODE_CHANGED',
        targetType: 'WORKSPACE',
        targetId: workspaceId,
        summary: `Developer Admin changed ${current.name} to ${mode.replaceAll('_', ' ')}.`,
        metadata: {
          previousCommerceMode: current.commerceMode,
          commerceMode: mode,
          developerAdminId: access.actor.id
        }
      }
    })
  ]);

  revalidatePath('/admin/system');
  revalidatePath('/admin/vendors');
  revalidatePath('/admin/settings');
  revalidatePath('/admin');
  revalidatePath('/vendor');
  revalidatePath('/store');
}
