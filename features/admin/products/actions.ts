'use server';

import { randomUUID } from 'node:crypto';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireAdminPermission } from '@/features/admin/auth/adminPermissions';

async function authorizeCatalogWrite() {
  return requireAdminPermission('product:update');
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

function productData(formData: FormData) {
  const name = text(formData, 'name');
  const slug = text(formData, 'slug').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const categoryId = text(formData, 'categoryId');
  if (!name || !slug || !categoryId) throw new Error('Name, slug, and category are required.');

  return {
    name,
    slug,
    categoryId,
    shortDescription: text(formData, 'shortDescription') || null,
    longDescription: text(formData, 'longDescription') || null,
    estimatedDelivery: text(formData, 'estimatedDelivery') || null,
    tags: text(formData, 'tags').split(',').map(tag => tag.trim()).filter(Boolean),
    active: formData.get('active') === 'on',
    featured: formData.get('featured') === 'on',
    isNew: formData.get('isNew') === 'on',
    discountPercentage: Math.min(Math.max(Number(text(formData, 'discountPercentage')) || 0, 0), 100)
  };
}

export async function createProduct(formData: FormData) {
  await requireAdminPermission('product:create');
  const data = productData(formData);
  const product = await prisma.product.create({ data: { id: randomUUID(), ...data } });
  revalidatePath('/admin/products');
  revalidatePath('/store');
  redirect(`/admin/products/${product.id}`);
}

export async function updateProduct(formData: FormData) {
  await authorizeCatalogWrite();
  const id = text(formData, 'id');
  if (!id) throw new Error('Product ID is required.');
  await prisma.product.update({ where: { id }, data: productData(formData) });
  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${id}`);
  revalidatePath('/store');
}
