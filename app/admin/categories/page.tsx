import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Boxes,
  Eye,
  EyeOff,
  Grid2X2Plus,
  Layers3,
  PencilLine,
  Plus,
  Shapes
} from 'lucide-react';

import { getAdminAccess } from '@/features/admin/auth/adminPermissions';
import { CategoryComposer, type CategoryComposerValue } from '@/features/admin/categories/CategoryComposer';
import {
  saveSubcategory,
  setCategoryActive,
  setSubcategoryActive
} from '@/features/admin/categories/actions';
import {
  AdminMetric,
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  adminFieldClass
} from '@/features/admin/components';
import { StudioSelectField } from '@/features/studio-controls';
import { prisma } from '@/lib/prisma';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{
  edit?: string;
  editSub?: string;
}>;

export default async function AdminCategoriesPage({ searchParams }: { searchParams: SearchParams }) {
  const access = await getAdminAccess();

  if (!access.permissions.has('category:view')) {
    throw new Error('Category Studio access is required.');
  }

  const { edit, editSub } = await searchParams;

  const [categories, editingCategory, editingSubcategory, media] = await Promise.all([
    prisma.category.findMany({
      include: {
        subcategories: {
          orderBy: [{ position: 'asc' }, { label: 'asc' }]
        },
        _count: {
          select: { products: true }
        }
      },
      orderBy: [{ position: 'asc' }, { label: 'asc' }]
    }),
    edit
      ? prisma.category.findUnique({ where: { id: edit } })
      : Promise.resolve(null),
    editSub
      ? prisma.subcategory.findUnique({ where: { id: editSub } })
      : Promise.resolve(null),
    prisma.mediaAsset.findMany({
      where: {
        workspaceId: access.membership.workspaceId,
        vendorProfileId: null,
        status: 'ACTIVE',
        resourceType: 'IMAGE'
      },
      orderBy: { createdAt: 'desc' },
      take: 180
    })
  ]);

  const activeCount = categories.filter(category => category.active).length;
  const subcategoryCount = categories.reduce((sum, category) => sum + category.subcategories.length, 0);
  const productCount = categories.reduce((sum, category) => sum + category._count.products, 0);
  const canManage = access.permissions.has('category:manage');

  const composerValue: CategoryComposerValue | null = editingCategory
    ? {
        id: editingCategory.id,
        label: editingCategory.label,
        slug: editingCategory.slug,
        iconName: editingCategory.iconName,
        image: editingCategory.image,
        coverImages: editingCategory.coverImages,
        shortDescription: editingCategory.shortDescription,
        description: editingCategory.description,
        accentColor: editingCategory.accentColor,
        className: editingCategory.className,
        active: editingCategory.active,
        position: editingCategory.position
      }
    : null;

  return (
    <AdminPage>
      <div className="space-y-5">
        <AdminPageHeader
          eyebrow="Catalog architecture"
          title="Category Studio"
          description="Compose Store categories, edit customer-facing presentation, control ordering and maintain the subcategory map used by products and discovery experiences."
          action={
            <Link
              href="/store?view=grid"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-border/70 bg-background px-4 text-sm font-bold transition hover:bg-muted">
              <Eye className="size-4" />
              Preview category grid
            </Link>
          }
        />

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AdminMetric icon={Grid2X2Plus} label="Categories" value={categories.length} />
          <AdminMetric icon={Eye} label="Visible categories" value={activeCount} />
          <AdminMetric icon={Layers3} label="Subcategories" value={subcategoryCount} />
          <AdminMetric icon={Boxes} label="Assigned products" value={productCount} />
        </section>

        {canManage ? (
          <AdminPanel
            title={editingCategory ? `Edit ${editingCategory.label}` : 'Compose a category'}
            description="The preview responds while you type. Saving updates the catalog and customer Store projections.">
            <CategoryComposer editing={composerValue} media={media} />
          </AdminPanel>
        ) : null}

        {canManage ? (
          <AdminPanel
            title={editingSubcategory ? `Edit ${editingSubcategory.label}` : 'Subcategory composer'}
            description="Subcategories remain attached to one parent category and can be independently ordered or hidden.">
            <form action={saveSubcategory} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {editingSubcategory ? <input type="hidden" name="id" value={editingSubcategory.id} /> : null}

              <Field label="Parent category">
                <StudioSelectField
                  name="categoryId"
                  defaultValue={editingSubcategory?.categoryId ?? editingCategory?.id ?? categories[0]?.id ?? ''}
                  options={categories.map(category => ({
                    value: category.id,
                    label: category.label
                  }))}
                />
              </Field>

              <Field label="Label">
                <input name="label" required defaultValue={editingSubcategory?.label ?? ''} className={adminFieldClass} />
              </Field>

              <Field label="Slug">
                <input name="slug" defaultValue={editingSubcategory?.slug ?? ''} placeholder="generated from label" className={adminFieldClass} />
              </Field>

              <Field label="Position">
                <input name="position" type="number" defaultValue={editingSubcategory?.position ?? 0} className={adminFieldClass} />
              </Field>

              <label className="flex min-h-12 items-center gap-3 self-end rounded-2xl border border-border/60 bg-background/60 px-4 text-sm font-bold">
                <input name="active" type="checkbox" defaultChecked={editingSubcategory?.active ?? true} />
                Visible
              </label>

              <div className="flex flex-wrap gap-3 sm:col-span-2 xl:col-span-5">
                <button className="inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-5 font-bold text-background">
                  <Plus className="size-4" />
                  {editingSubcategory ? 'Save subcategory' : 'Add subcategory'}
                </button>
                {editingSubcategory ? (
                  <Link href="/admin/categories" className="inline-flex h-12 items-center rounded-full px-5 font-bold text-muted-foreground">
                    Cancel editing
                  </Link>
                ) : null}
              </div>
            </form>
          </AdminPanel>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {categories.map(category => {
            const previewImage = category.image || category.coverImages[0] || null;

            return (
              <article key={category.id} className="overflow-hidden rounded-[2rem] border border-border/60 bg-card/75 shadow-sm">
                <div className="relative aspect-[16/7] overflow-hidden bg-muted">
                  {previewImage ? (
                    <Image src={previewImage} alt="" fill sizes="560px" className="object-cover" />
                  ) : (
                    <div className="grid size-full place-items-center">
                      <Shapes className="size-9 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                  <span
                    className="absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-black text-white shadow-lg"
                    style={{ backgroundColor: category.accentColor ?? '#475569' }}>
                    {category.active ? 'Visible' : 'Hidden'}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/70">
                      Position {category.position} · {category._count.products} products
                    </p>
                    <h2 className="mt-1 text-2xl font-black">{category.label}</h2>
                  </div>
                </div>

                <div className="p-5">
                  <p className="line-clamp-2 min-h-12 text-sm leading-6 text-muted-foreground">
                    {category.shortDescription ?? category.description ?? 'No customer-facing description yet.'}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {category.subcategories.length ? category.subcategories.map(subcategory => (
                      <div
                        key={subcategory.id}
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-xs font-semibold',
                          subcategory.active ? 'border-border/70 bg-background' : 'border-border/40 bg-muted/40 text-muted-foreground'
                        )}>
                        <Link href={`/admin/categories?editSub=${subcategory.id}`} className="hover:text-primary">
                          {subcategory.label}
                        </Link>
                        {canManage ? (
                          <form action={setSubcategoryActive}>
                            <input type="hidden" name="id" value={subcategory.id} />
                            <input type="hidden" name="active" value={subcategory.active ? 'false' : 'true'} />
                            <button type="submit" className="grid size-5 place-items-center rounded-full hover:bg-muted" aria-label={`${subcategory.active ? 'Hide' : 'Show'} ${subcategory.label}`}>
                              {subcategory.active ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                            </button>
                          </form>
                        ) : null}
                      </div>
                    )) : (
                      <span className="text-sm text-muted-foreground">No subcategories yet.</span>
                    )}
                  </div>

                  {canManage ? (
                    <div className="mt-5 flex flex-wrap gap-2 border-t border-border/60 pt-4">
                      <Link
                        href={`/admin/categories?edit=${category.id}`}
                        className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-bold text-background">
                        <PencilLine className="size-4" />
                        Edit category
                      </Link>
                      <form action={setCategoryActive}>
                        <input type="hidden" name="id" value={category.id} />
                        <input type="hidden" name="active" value={category.active ? 'false' : 'true'} />
                        <button className="inline-flex h-10 items-center gap-2 rounded-full border border-border/70 px-4 text-sm font-bold">
                          {category.active ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          {category.active ? 'Hide' : 'Show'}
                        </button>
                      </form>
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </AdminPage>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label>
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
