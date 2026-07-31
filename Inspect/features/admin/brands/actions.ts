'use server';

import { revalidatePath } from 'next/cache';

import { requireAdminPermission } from '@/features/admin/auth/adminPermissions';
import { prisma } from '@/lib/prisma';

function text(data: FormData, key: string): string {
  return String(data.get(key) ?? '').trim();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function revalidateBrandSurfaces(): void {
  revalidatePath('/admin/brands');
  revalidatePath('/admin/products');
  revalidatePath('/admin/products/new');
  revalidatePath('/vendor/products');
  revalidatePath('/store');
  revalidatePath('/api/catalog');
}

async function writeBrandAudit(input: {
  workspaceId: string;
  actorId: string;
  action: string;
  targetId: string;
  summary: string;
}): Promise<void> {
  await prisma.adminAuditEvent.create({
    data: {
      workspaceId: input.workspaceId,
      actorId: input.actorId,
      action: input.action,
      targetType: 'OTHER',
      targetId: input.targetId,
      summary: input.summary,
      metadata: {
        registry: 'BRAND'
      }
    }
  });
}

export async function saveBrand(formData: FormData): Promise<void> {
  const access = await requireAdminPermission('brand:manage');
  const id = text(formData, 'id') || null;
  const name = text(formData, 'name');
  const slug = slugify(text(formData, 'slug') || name);

  if (!name || !slug) {
    throw new Error('Brand name and slug are required.');
  }

  const [existing, conflict] = await Promise.all([
    id
      ? prisma.brand.findUnique({
          where: { id },
          select: { id: true }
        })
      : Promise.resolve(null),
    prisma.brand.findFirst({
      where: {
        slug,
        ...(id ? { id: { not: id } } : {})
      },
      select: { id: true }
    })
  ]);

  if (id && !existing) {
    throw new Error('The selected brand was not found.');
  }

  if (conflict) {
    throw new Error('Another brand already uses this slug.');
  }

  const data = {
    name,
    slug,
    description: text(formData, 'description') || null,
    logo: text(formData, 'logo') || null,
    image: text(formData, 'image') || null,
    active: formData.get('active') === 'on'
  };

  const brand = id
    ? await prisma.brand.update({
        where: { id },
        data,
        select: { id: true, name: true }
      })
    : await prisma.brand.create({
        data,
        select: { id: true, name: true }
      });

  await writeBrandAudit({
    workspaceId: access.membership.workspaceId,
    actorId: access.session.user.id,
    action: id ? 'BRAND_UPDATED' : 'BRAND_CREATED',
    targetId: brand.id,
    summary: `${brand.name} was ${id ? 'updated' : 'created'} in Brand Studio.`
  });

  revalidateBrandSurfaces();
}

export async function setBrandActive(formData: FormData): Promise<void> {
  const access = await requireAdminPermission('brand:manage');
  const id = text(formData, 'id');
  const active = text(formData, 'active') === 'true';

  if (!id) {
    throw new Error('A brand is required.');
  }

  const brand = await prisma.brand.update({
    where: { id },
    data: { active },
    select: { id: true, name: true }
  });

  await writeBrandAudit({
    workspaceId: access.membership.workspaceId,
    actorId: access.session.user.id,
    action: active ? 'BRAND_ACTIVATED' : 'BRAND_DEACTIVATED',
    targetId: brand.id,
    summary: `${brand.name} was ${active ? 'activated' : 'deactivated'} in Brand Studio.`
  });

  revalidateBrandSurfaces();
}
