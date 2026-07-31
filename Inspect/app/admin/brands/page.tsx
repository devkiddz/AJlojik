import Link from 'next/link';
import {
  Boxes,
  Eye,
  EyeOff,
  PackagePlus,
  PencilLine,
  Tags
} from 'lucide-react';

import { getAdminAccess } from '@/features/admin/auth/adminPermissions';
import {
  BrandComposer,
  type BrandComposerValue
} from '@/features/admin/brands/BrandComposer';
import { setBrandActive } from '@/features/admin/brands/actions';
import {
  AdminEmptyState,
  AdminMetric,
  AdminPage,
  AdminPageHeader,
  AdminPanel
} from '@/features/admin/components';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{
  edit?: string;
}>;

export default async function AdminBrandsPage({ searchParams }: { searchParams: SearchParams }) {
  const access = await getAdminAccess();

  if (!access.permissions.has('brand:view')) {
    throw new Error('Brand Studio access is required.');
  }

  const { edit } = await searchParams;
  const workspaceId = access.membership.workspaceId;

  const [brands, editingBrand, unbrandedProductCount] = await Promise.all([
    prisma.brand.findMany({
      include: {
        _count: {
          select: {
            products: {
              where: { workspaceId }
            }
          }
        }
      },
      orderBy: [{ active: 'desc' }, { name: 'asc' }]
    }),
    edit
      ? prisma.brand.findUnique({ where: { id: edit } })
      : Promise.resolve(null),
    prisma.product.count({
      where: {
        workspaceId,
        status: { not: 'ARCHIVED' },
        brandId: null
      }
    })
  ]);

  const canManage = access.permissions.has('brand:manage');
  const activeCount = brands.filter(brand => brand.active).length;
  const assignedProductCount = brands.reduce(
    (sum, brand) => sum + brand._count.products,
    0
  );
  const composerValue: BrandComposerValue | null = editingBrand
    ? {
        id: editingBrand.id,
        name: editingBrand.name,
        slug: editingBrand.slug,
        description: editingBrand.description,
        logo: editingBrand.logo,
        image: editingBrand.image,
        active: editingBrand.active
      }
    : null;

  return (
    <AdminPage>
      <div className="space-y-5">
        <AdminPageHeader
          eyebrow="Catalog identity"
          title="Brand Studio"
          description="Create and maintain the shared brand registry used by Product Studio, Vendor submissions and customer discovery. Deactivating a brand prevents new assignments without removing it from existing products."
          action={
            <Link
              href="/admin/products/new"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-border/70 bg-background px-4 text-sm font-bold transition hover:bg-muted">
              <PackagePlus className="size-4" />
              Create branded product
            </Link>
          }
        />

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AdminMetric icon={Tags} label="Registered brands" value={brands.length} />
          <AdminMetric icon={Eye} label="Assignable brands" value={activeCount} />
          <AdminMetric icon={Boxes} label="Workspace products assigned" value={assignedProductCount} />
          <AdminMetric icon={EyeOff} label="Products without a brand" value={unbrandedProductCount} />
        </section>

        {canManage ? (
          <AdminPanel
            title={editingBrand ? `Edit ${editingBrand.name}` : 'Compose a brand'}
            description="Create reusable brand identity once, then assign it from Admin or Vendor Product Studio.">
            <BrandComposer editing={composerValue} />
          </AdminPanel>
        ) : null}

        {brands.length ? (
          <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {brands.map(brand => {
              const previewImage = brand.image || brand.logo;

              return (
                <article key={brand.id} className="overflow-hidden rounded-[2rem] border border-border/60 bg-card/75 shadow-sm">
                  <div className="relative aspect-[16/7] overflow-hidden bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.18),transparent_58%)]">
                    {previewImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewImage} alt="" className="size-full object-cover" />
                    ) : (
                      <div className="grid size-full place-items-center">
                        <Tags className="size-10 text-muted-foreground/35" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" />
                    {brand.logo && brand.image ? (
                      <span className="absolute left-4 top-4 grid size-12 place-items-center overflow-hidden rounded-2xl border border-white/25 bg-white/90 p-2 shadow-xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={brand.logo} alt="" className="size-full object-contain" />
                      </span>
                    ) : null}
                    <span className="absolute right-4 top-4 rounded-full bg-black/55 px-3 py-1.5 text-xs font-black text-white backdrop-blur-xl">
                      {brand.active ? 'Assignable' : 'Inactive'}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/70">
                        {brand._count.products} workspace products
                      </p>
                      <h2 className="mt-1 text-2xl font-black">{brand.name}</h2>
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="line-clamp-2 min-h-12 text-sm leading-6 text-muted-foreground">
                      {brand.description ?? 'No customer-facing brand description yet.'}
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-muted/45 px-3 py-2 text-xs">
                      <span className="text-muted-foreground">Slug</span>
                      <strong className="truncate">{brand.slug}</strong>
                    </div>

                    {canManage ? (
                      <div className="mt-5 flex flex-wrap gap-2 border-t border-border/60 pt-4">
                        <Link
                          href={`/admin/brands?edit=${brand.id}`}
                          className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-bold text-background">
                          <PencilLine className="size-4" />
                          Edit brand
                        </Link>
                        <form action={setBrandActive}>
                          <input type="hidden" name="id" value={brand.id} />
                          <input type="hidden" name="active" value={brand.active ? 'false' : 'true'} />
                          <button className="inline-flex h-10 items-center gap-2 rounded-full border border-border/70 px-4 text-sm font-bold">
                            {brand.active ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            {brand.active ? 'Deactivate' : 'Activate'}
                          </button>
                        </form>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <AdminEmptyState
            icon={Tags}
            title="No brands created"
            description="Create the first brand identity, then assign it to products from Product Studio."
          />
        )}
      </div>
    </AdminPage>
  );
}
