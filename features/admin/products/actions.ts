'use server';

import { randomUUID } from 'node:crypto';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import { requireAdminPermission } from '@/features/admin/auth/adminPermissions';

type ProductPermission =
  | 'product:create'
  | 'product:update';

async function requireCatalogWorkspaceId(
  permission: ProductPermission
): Promise<string> {
  await requireAdminPermission(permission);

  const session = await auth.api.getSession({
    headers: await headers()
  });

  const userId = session?.user?.id;

  if (!userId) {
    throw new Error(
      'Authentication is required.'
    );
  }

  const staffProfile =
    await prisma.staffProfile.findUnique({
      where: {
        userId
      },

      select: {
        workspaceId: true,
        active: true,

        workspace: {
          select: {
            active: true
          }
        }
      }
    });

  if (
    !staffProfile ||
    !staffProfile.active ||
    !staffProfile.workspace.active
  ) {
    throw new Error(
      'An active admin workspace is required.'
    );
  }

  return staffProfile.workspaceId;
}

function text(
  formData: FormData,
  key: string
): string {
  return String(
    formData.get(key) ?? ''
  ).trim();
}

function productData(
  formData: FormData
) {
  const name = text(
    formData,
    'name'
  );

  const slug = text(
    formData,
    'slug'
  )
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const categoryId = text(
    formData,
    'categoryId'
  );

  if (
    !name ||
    !slug ||
    !categoryId
  ) {
    throw new Error(
      'Name, slug, and category are required.'
    );
  }

  const tags = text(
    formData,
    'tags'
  )
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean);

  const discountPercentage =
    Math.min(
      Math.max(
        Number(
          text(
            formData,
            'discountPercentage'
          )
        ) || 0,
        0
      ),
      100
    );

  return {
    name,
    slug,
    categoryId,

    shortDescription:
      text(
        formData,
        'shortDescription'
      ) || null,

    longDescription:
      text(
        formData,
        'longDescription'
      ) || null,

    estimatedDelivery:
      text(
        formData,
        'estimatedDelivery'
      ) || null,

    tags,

    active:
      formData.get('active') ===
      'on',

    featured:
      formData.get('featured') ===
      'on',

    isNew:
      formData.get('isNew') ===
      'on',

    discountPercentage
  };
}

async function assertCategoryExists(
  categoryId: string
): Promise<void> {
  const category =
    await prisma.category.findFirst({
      where: {
        id: categoryId,
        active: true
      },

      select: {
        id: true
      }
    });

  if (!category) {
    throw new Error(
      'The selected category is unavailable.'
    );
  }
}

export async function createProduct(
  formData: FormData
) {
  const workspaceId =
    await requireCatalogWorkspaceId(
      'product:create'
    );

  const data =
    productData(formData);

  await assertCategoryExists(
    data.categoryId
  );

const existingProduct =
  await prisma.product.findFirst({
    where: {
      workspaceId,
      slug: data.slug
    },

    select: {
      id: true
    }
  });

  if (existingProduct) {
    throw new Error(
      'A product with this slug already exists in the current workspace.'
    );
  }

  const product =
    await prisma.product.create({
      data: {
        id: randomUUID(),
        workspaceId,
        ...data
      },

      select: {
        id: true
      }
    });

  revalidatePath(
    '/admin/products'
  );

  revalidatePath('/store');

  redirect(
    `/admin/products/${product.id}`
  );
}

export async function updateProduct(
  formData: FormData
) {
  const workspaceId =
    await requireCatalogWorkspaceId(
      'product:update'
    );

  const id = text(
    formData,
    'id'
  );

  if (!id) {
    throw new Error(
      'Product ID is required.'
    );
  }

  const data =
    productData(formData);

  await assertCategoryExists(
    data.categoryId
  );

  const existingProduct =
    await prisma.product.findFirst({
      where: {
        id,
        workspaceId
      },

      select: {
        id: true
      }
    });

  if (!existingProduct) {
    throw new Error(
      'The selected product was not found in this workspace.'
    );
  }

  const conflictingProduct =
    await prisma.product.findFirst({
      where: {
        workspaceId,
        slug: data.slug,

        id: {
          not: id
        }
      },

      select: {
        id: true
      }
    });

  if (conflictingProduct) {
    throw new Error(
      'Another product with this slug already exists in the current workspace.'
    );
  }

  await prisma.product.update({
    where: {
      id
    },

    data
  });

  revalidatePath(
    '/admin/products'
  );

  revalidatePath(
    `/admin/products/${id}`
  );

  revalidatePath('/store');
}