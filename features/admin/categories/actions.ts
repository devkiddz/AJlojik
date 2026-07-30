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

function position(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(-1000, Math.min(1000, Math.round(parsed))) : 0;
}

function parseCoverImages(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(/[\n,]+/)
        .map(item => item.trim())
        .filter(Boolean)
    )
  ).slice(0, 12);
}

async function writeAudit(input: {
  workspaceId: string;
  actorId: string;
  action: string;
  targetId: string;
  summary: string;
}) {
  await prisma.adminAuditEvent.create({
    data: {
      workspaceId: input.workspaceId,
      actorId: input.actorId,
      action: input.action,
      targetType: 'OTHER',
      targetId: input.targetId,
      summary: input.summary
    }
  });
}

function revalidateCategorySurfaces() {
  revalidatePath('/admin/categories');
  revalidatePath('/store');
  revalidatePath('/');
  revalidatePath('/api/catalog');
}

export async function saveCategory(formData: FormData): Promise<void> {
  const access = await requireAdminPermission('category:manage');
  const existingId = text(formData, 'id') || null;
  const label = text(formData, 'label');
  const slug = slugify(text(formData, 'slug') || label);

  if (!label || !slug) {
    throw new Error('Category label and slug are required.');
  }

  const conflict = await prisma.category.findFirst({
    where: {
      slug,
      ...(existingId ? { id: { not: existingId } } : {})
    },
    select: { id: true }
  });

  if (conflict) {
    throw new Error('Another category already uses this slug.');
  }

  const data = {
    label,
    slug,
    iconName: text(formData, 'iconName') || null,
    image: text(formData, 'image') || null,
    coverImages: parseCoverImages(text(formData, 'coverImages')),
    shortDescription: text(formData, 'shortDescription') || null,
    description: text(formData, 'description') || null,
    accentColor: text(formData, 'accentColor') || null,
    className: text(formData, 'className') || null,
    active: formData.get('active') === 'on',
    position: position(text(formData, 'position'))
  };

  const category = existingId
    ? await prisma.category.update({
        where: { id: existingId },
        data,
        select: { id: true, label: true }
      })
    : await prisma.category.create({
        data: {
          id: `category_${slug}`,
          ...data
        },
        select: { id: true, label: true }
      });

  await writeAudit({
    workspaceId: access.membership.workspaceId,
    actorId: access.session.user.id,
    action: existingId ? 'CATEGORY_UPDATED' : 'CATEGORY_CREATED',
    targetId: category.id,
    summary: `${category.label} was ${existingId ? 'updated' : 'created'} in Category Studio.`
  });

  revalidateCategorySurfaces();
}

export async function setCategoryActive(formData: FormData): Promise<void> {
  const access = await requireAdminPermission('category:manage');
  const id = text(formData, 'id');
  const active = text(formData, 'active') === 'true';

  if (!id) {
    throw new Error('A category is required.');
  }

  const category = await prisma.category.update({
    where: { id },
    data: { active },
    select: { id: true, label: true }
  });

  await writeAudit({
    workspaceId: access.membership.workspaceId,
    actorId: access.session.user.id,
    action: active ? 'CATEGORY_ACTIVATED' : 'CATEGORY_DEACTIVATED',
    targetId: category.id,
    summary: `${category.label} was ${active ? 'activated' : 'deactivated'} in Category Studio.`
  });

  revalidateCategorySurfaces();
}

export async function saveSubcategory(formData: FormData): Promise<void> {
  const access = await requireAdminPermission('category:manage');
  const id = text(formData, 'id') || null;
  const categoryId = text(formData, 'categoryId');
  const label = text(formData, 'label');
  const slug = slugify(text(formData, 'slug') || label);

  if (!categoryId || !label || !slug) {
    throw new Error('Category, subcategory label and slug are required.');
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true, label: true }
  });

  if (!category) {
    throw new Error('The parent category was not found.');
  }

  const conflict = await prisma.subcategory.findFirst({
    where: {
      categoryId,
      slug,
      ...(id ? { id: { not: id } } : {})
    },
    select: { id: true }
  });

  if (conflict) {
    throw new Error('This category already has a subcategory with that slug.');
  }

  const data = {
    categoryId,
    label,
    slug,
    active: formData.get('active') === 'on',
    position: position(text(formData, 'position'))
  };

  const subcategory = id
    ? await prisma.subcategory.update({
        where: { id },
        data,
        select: { id: true, label: true }
      })
    : await prisma.subcategory.create({
        data,
        select: { id: true, label: true }
      });

  await writeAudit({
    workspaceId: access.membership.workspaceId,
    actorId: access.session.user.id,
    action: id ? 'SUBCATEGORY_UPDATED' : 'SUBCATEGORY_CREATED',
    targetId: subcategory.id,
    summary: `${subcategory.label} was ${id ? 'updated' : 'created'} under ${category.label}.`
  });

  revalidateCategorySurfaces();
}

export async function setSubcategoryActive(formData: FormData): Promise<void> {
  const access = await requireAdminPermission('category:manage');
  const id = text(formData, 'id');
  const active = text(formData, 'active') === 'true';

  if (!id) {
    throw new Error('A subcategory is required.');
  }

  const subcategory = await prisma.subcategory.update({
    where: { id },
    data: { active },
    select: { id: true, label: true }
  });

  await writeAudit({
    workspaceId: access.membership.workspaceId,
    actorId: access.session.user.id,
    action: active ? 'SUBCATEGORY_ACTIVATED' : 'SUBCATEGORY_DEACTIVATED',
    targetId: subcategory.id,
    summary: `${subcategory.label} was ${active ? 'activated' : 'deactivated'} in Category Studio.`
  });

  revalidateCategorySurfaces();
}
