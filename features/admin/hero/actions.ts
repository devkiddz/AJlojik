'use server';

import { revalidatePath } from 'next/cache';

import { requireAdminPermission } from '@/features/admin/auth/adminPermissions';
import { prisma } from '@/lib/prisma';

const value = (data: FormData, key: string) => String(data.get(key) ?? '').trim();

export async function updateStorefrontHero(formData: FormData) {
  const access = await requireAdminPermission('system:manage');
  const title = value(formData, 'title');
  if (!title) throw new Error('Hero title is required.');

  await prisma.storefrontHero.upsert({
    where: { workspaceId: access.membership.workspaceId },
    create: {
      workspaceId: access.membership.workspaceId,
      enabled: formData.get('enabled') === 'on',
      autoplay: formData.get('autoplay') === 'on',
      mediaType: value(formData, 'mediaType') === 'IMAGE' ? 'IMAGE' : 'VIDEO',
      mediaUrl: value(formData, 'mediaUrl') || null,
      posterUrl: value(formData, 'posterUrl') || null,
      eyebrow: value(formData, 'eyebrow'), title,
      summary: value(formData, 'summary') || null,
      primaryLabel: value(formData, 'primaryLabel'), primaryHref: value(formData, 'primaryHref'),
      secondaryLabel: value(formData, 'secondaryLabel'), secondaryHref: value(formData, 'secondaryHref')
    },
    update: {
      enabled: formData.get('enabled') === 'on',
      autoplay: formData.get('autoplay') === 'on',
      mediaType: value(formData, 'mediaType') === 'IMAGE' ? 'IMAGE' : 'VIDEO',
      mediaUrl: value(formData, 'mediaUrl') || null,
      posterUrl: value(formData, 'posterUrl') || null,
      eyebrow: value(formData, 'eyebrow'), title,
      summary: value(formData, 'summary') || null,
      primaryLabel: value(formData, 'primaryLabel'), primaryHref: value(formData, 'primaryHref'),
      secondaryLabel: value(formData, 'secondaryLabel'), secondaryHref: value(formData, 'secondaryHref')
    }
  });

  await prisma.adminAuditEvent.create({ data: { workspaceId: access.membership.workspaceId, actorId: access.session.user.id, action: 'STOREFRONT_HERO_UPDATED', targetType: 'EXPERIENCE', summary: `Homepage hero updated by ${access.session.user.name}.`, metadata: { mediaType: value(formData, 'mediaType'), enabled: formData.get('enabled') === 'on' } } });

  revalidatePath('/');
  revalidatePath('/admin/hero');
}
