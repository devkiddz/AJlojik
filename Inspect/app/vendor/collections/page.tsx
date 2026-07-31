import Link from 'next/link';
import type { ReactNode } from 'react';
import { FolderKanban, Layers3, ShieldCheck } from 'lucide-react';

import {
  AdminMetric,
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  adminFieldClass
} from '@/features/admin/components';
import { getVendorAccess } from '@/features/vendor/auth/vendorAccess';
import {
  archiveVendorRecord,
  MediaChoiceGrid,
  saveVendorCollection
} from '@/features/vendor/studios';
import { prisma } from '@/lib/prisma';

type VendorCollectionsPageProps = {
  searchParams: Promise<{ edit?: string }>;
};

function dateTimeLocal(value: Date | null | undefined): string {
  return value ? value.toISOString().slice(0, 16) : '';
}

export default async function VendorCollectionsPage({
  searchParams
}: VendorCollectionsPageProps) {
  const access = await getVendorAccess();

  if (!access.permissions.has('collection:view')) {
    throw new Error('Collection access is required.');
  }

  const { edit } = await searchParams;
  const [collections, products, media, editing] = await Promise.all([
    prisma.storeCollection.findMany({
      where: {
        workspaceId: access.workspace.id,
        vendorProfileId: access.vendor.id,
        status: { not: 'ARCHIVED' }
      },
      include: {
        coverMediaAsset: true,
        products: true
      },
      orderBy: { updatedAt: 'desc' }
    }),
    prisma.product.findMany({
      where: {
        workspaceId: access.workspace.id,
        vendorProfileId: access.vendor.id,
        status: 'PUBLISHED',
        active: true
      },
      orderBy: { name: 'asc' },
      select: { id: true, name: true }
    }),
    prisma.mediaAsset.findMany({
      where: {
        workspaceId: access.workspace.id,
        vendorProfileId: access.vendor.id,
        status: 'ACTIVE',
        resourceType: 'IMAGE'
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    }),
    edit
      ? prisma.storeCollection.findFirst({
          where: {
            id: edit,
            workspaceId: access.workspace.id,
            vendorProfileId: access.vendor.id,
            status: { not: 'ARCHIVED' }
          },
          include: { products: true }
        })
      : null
  ]);

  return (
    <AdminPage>
      <div className="mx-auto max-w-[96rem] space-y-5">
        <AdminPageHeader
          eyebrow="Vendor merchandising"
          title="Collection Studio"
          description="Assemble published vendor products into scheduled collections, then submit the complete collection for workspace approval."
        />

        <section className="grid gap-3 sm:grid-cols-3">
          <AdminMetric icon={FolderKanban} label="Collections" value={collections.length} />
          <AdminMetric
            icon={Layers3}
            label="Awaiting review"
            value={collections.filter(item => item.status === 'PENDING_REVIEW').length}
          />
          <AdminMetric
            icon={ShieldCheck}
            label="Published"
            value={collections.filter(item => item.status === 'PUBLISHED').length}
          />
        </section>

        {access.permissions.has('collection:manage') ? (
          <AdminPanel
            title={editing ? `Edit ${editing.title}` : 'Create collection'}
            description="Only your active published products and your own Media Studio assets can be included.">
            <form action={saveVendorCollection} className="grid gap-4 lg:grid-cols-3">
              {editing ? <input type="hidden" name="id" value={editing.id} /> : null}

              <Field label="Title">
                <input
                  name="title"
                  defaultValue={editing?.title}
                  required
                  className={adminFieldClass}
                />
              </Field>

              <Field label="Slug">
                <input name="slug" defaultValue={editing?.slug} className={adminFieldClass} />
              </Field>

              <Field label="Layout">
                <select
                  name="layout"
                  defaultValue={editing?.layout ?? 'CAROUSEL'}
                  className={adminFieldClass}>
                  <option value="CAROUSEL">Carousel</option>
                  <option value="FEATURED">Featured</option>
                  <option value="GRID">Grid</option>
                  <option value="SPOTLIGHT">Spotlight</option>
                </select>
              </Field>

              <Field label="Subtitle">
                <input
                  name="subtitle"
                  defaultValue={editing?.subtitle ?? ''}
                  className={adminFieldClass}
                />
              </Field>

              <Field label="Featured product">
                <select
                  name="featuredProductId"
                  defaultValue={editing?.featuredProductId ?? ''}
                  className={adminFieldClass}>
                  <option value="">No featured product</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Requested priority (0–10)">
                <input
                  name="priority"
                  type="number"
                  min="0"
                  max="10"
                  defaultValue={editing?.priority ?? 0}
                  className={adminFieldClass}
                />
              </Field>

              <Field label="Starts">
                <input
                  name="startsAt"
                  type="datetime-local"
                  defaultValue={dateTimeLocal(editing?.startsAt)}
                  className={adminFieldClass}
                />
              </Field>

              <Field label="Ends">
                <input
                  name="endsAt"
                  type="datetime-local"
                  defaultValue={dateTimeLocal(editing?.endsAt)}
                  className={adminFieldClass}
                />
              </Field>

              <Field label="Description" className="lg:col-span-3">
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editing?.description ?? ''}
                  className={adminFieldClass}
                />
              </Field>

              <fieldset className="lg:col-span-3">
                <legend className="mb-2 text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Cover gallery
                </legend>
                <MediaChoiceGrid
                  media={media}
                  name="coverMediaAssetId"
                  initialIds={editing?.coverMediaAssetId ? [editing.coverMediaAssetId] : []}
                  apiBasePath="/api/vendor/media"
                  purpose="collections"
                  uploadAccept="image"
                  acceptedResourceTypes={['IMAGE']}
                />
              </fieldset>

              <fieldset className="lg:col-span-3">
                <legend className="mb-2 text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Collection products
                </legend>
                <div className="grid max-h-64 gap-2 overflow-y-auto rounded-3xl border border-border/60 p-3 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map(product => (
                    <label
                      key={product.id}
                      className="flex items-center gap-2 rounded-xl p-2 text-xs hover:bg-muted">
                      <input
                        type="checkbox"
                        name="productIds"
                        value={product.id}
                        defaultChecked={editing?.products.some(
                          item => item.productId === product.id
                        )}
                      />
                      <span className="truncate">{product.name}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="flex flex-wrap gap-3 lg:col-span-3">
                <button
                  name="intent"
                  value="draft"
                  className="h-11 rounded-full border border-border px-5 text-xs font-bold">
                  Save draft
                </button>
                <button
                  name="intent"
                  value="submit"
                  className="h-11 rounded-full bg-foreground px-5 text-xs font-bold text-background">
                  Submit for approval
                </button>
                {editing ? (
                  <Link
                    href="/vendor/collections"
                    className="h-11 rounded-full px-5 text-xs font-bold leading-[2.75rem] text-muted-foreground">
                    Cancel editing
                  </Link>
                ) : null}
              </div>
            </form>
          </AdminPanel>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {collections.map(collection => (
            <article
              key={collection.id}
              className="overflow-hidden rounded-[2rem] border border-border/60 bg-card/75">
              <div className="aspect-[16/8] bg-muted">
                {collection.coverMediaAsset ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={collection.coverMediaAsset.secureUrl}
                    alt={collection.title}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="grid size-full place-items-center">
                    <FolderKanban className="size-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="p-5">
                <span className="rounded-full bg-muted px-2 py-1 text-[8px] font-black">
                  {collection.status.replaceAll('_', ' ')}
                </span>
                <h2 className="mt-3 text-lg font-black">{collection.title}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {collection.products.length} products · {collection.layout.toLowerCase()}
                </p>
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/vendor/collections?edit=${collection.id}`}
                    className="rounded-full bg-foreground px-3 py-2 text-[9px] font-bold text-background">
                    Edit
                  </Link>
                  <form action={archiveVendorRecord.bind(null, 'collection')}>
                    <input type="hidden" name="id" value={collection.id} />
                    <button className="rounded-full border border-border px-3 py-2 text-[9px] font-bold">
                      Archive
                    </button>
                  </form>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </AdminPage>
  );
}

function Field({
  label,
  children,
  className = ''
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
