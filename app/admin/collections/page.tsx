import Link from 'next/link';
import { FolderKanban, Grid3X3, ImageIcon, Layers3 } from 'lucide-react';

import { getAdminAccess } from '@/features/admin/auth/adminPermissions';
import {
  saveStoreCollection,
  setStoreCollectionStatus
} from '@/features/admin/collections/actions';
import {
  AdminMetric,
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  adminFieldClass
} from '@/features/admin/components';
import { MediaChoiceGrid } from '@/features/admin/media';
import {
  StudioPreviewDialog,
  StudioProductPicker,
  StudioProductSummary,
  StudioSelectField
} from '@/features/studio-controls';
import { resolveStudioCroppedMedia } from '@/features/studio-controls/cropMetadata';
import { resolveStudioProducts } from '@/features/studio-controls/server/resolveStudioProducts';
import { prisma } from '@/lib/prisma';

function datetime(value: Date | null | undefined) {
  if (!value) return '';
  const offset = value.getTimezoneOffset();
  return new Date(value.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

export default async function AdminCollectionsPage({
  searchParams
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const access = await getAdminAccess();
  if (!access.permissions.has('collection:view')) {
    throw new Error('Collection Studio access is required.');
  }

  const { edit } = await searchParams;
  const workspaceId = access.membership.workspaceId;
  const [collections, products, media, vendors, editing] = await Promise.all([
    prisma.storeCollection.findMany({
      where: { workspaceId, status: { not: 'ARCHIVED' } },
      include: {
        coverMediaAsset: true,
        vendorProfile: { select: { name: true } },
        products: {
          orderBy: { position: 'asc' },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                status: true,
                active: true,
                images: { orderBy: [{ primary: 'desc' }, { position: 'asc' }], take: 1, select: { url: true } },
                variants: { where: { active: true }, include: { inventory: true } },
                category: { select: { label: true } },
                vendorProfile: { select: { name: true } }
              }
            }
          }
        }
      },
      orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }]
    }),
    resolveStudioProducts({ workspaceId }),
    prisma.mediaAsset.findMany({
      where: { workspaceId, status: 'ACTIVE', resourceType: 'IMAGE' },
      orderBy: { createdAt: 'desc' },
      take: 150
    }),
    access.membership.workspace.commerceMode === 'MULTI_VENDOR'
      ? prisma.vendorProfile.findMany({
          where: { workspaceId, status: 'ACTIVE', active: true },
          orderBy: { name: 'asc' },
          select: { id: true, name: true }
        })
      : Promise.resolve([]),
    edit
      ? prisma.storeCollection.findFirst({
          where: { id: edit, workspaceId },
          include: {
            products: true,
            coverMediaAsset: {
              select: {
                id: true,
                secureUrl: true,
                displayName: true,
                originalFilename: true,
                metadata: true
              }
            }
          }
        })
      : null
  ]);

  return (
    <AdminPage>
      <div className="mx-auto max-w-[96rem] space-y-5">
        <AdminPageHeader
          eyebrow="Merchandising Studio"
          title="Collection Studio"
          description="Compose visual product stories with searchable product selection, image-aware counts, non-destructive cover crops and responsive previews."
        />

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AdminMetric icon={FolderKanban} label="Collections" value={collections.length} />
          <AdminMetric icon={Grid3X3} label="Published" value={collections.filter(item => item.status === 'PUBLISHED').length} />
          <AdminMetric icon={Layers3} label="Awaiting review" value={collections.filter(item => item.status === 'PENDING_REVIEW').length} />
          <AdminMetric icon={ImageIcon} label="Available covers" value={media.length} />
        </section>

        {access.permissions.has('collection:manage') ? (
          <AdminPanel
            title={editing ? `Edit ${editing.title}` : 'Create collection'}
            description="Choose products visually and preview the saved composition without leaving the Studio.">
            <form action={saveStoreCollection} className="grid gap-4 lg:grid-cols-3">
              {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
              <Field label="Title"><input name="title" defaultValue={editing?.title} required className={adminFieldClass} /></Field>
              <Field label="Slug"><input name="slug" defaultValue={editing?.slug} className={adminFieldClass} /></Field>
              <Field label="Layout"><StudioSelectField name="layout" defaultValue={editing?.layout ?? 'CAROUSEL'} options={[{ value: 'CAROUSEL', label: 'Carousel' }, { value: 'FEATURED', label: 'Featured' }, { value: 'GRID', label: 'Grid' }, { value: 'SPOTLIGHT', label: 'Spotlight' }]} /></Field>
              <Field label="Subtitle"><input name="subtitle" defaultValue={editing?.subtitle ?? ''} className={adminFieldClass} /></Field>
              <Field label="Featured product · automatically included"><StudioSelectField name="featuredProductId" defaultValue={editing?.featuredProductId ?? ''} placeholder="No featured product" options={[{ value: '', label: 'No featured product' }, ...products.map(product => ({ value: product.id, label: product.name }))]} /></Field>
              <Field label="Priority"><input name="priority" type="number" defaultValue={editing?.priority ?? 0} className={adminFieldClass} /></Field>
              <Field label="Starts"><input name="startsAt" type="datetime-local" defaultValue={datetime(editing?.startsAt)} className={adminFieldClass} /></Field>
              <Field label="Ends"><input name="endsAt" type="datetime-local" defaultValue={datetime(editing?.endsAt)} className={adminFieldClass} /></Field>
              {vendors.length ? <Field label="Vendor owner"><StudioSelectField name="vendorProfileId" defaultValue={editing?.vendorProfileId ?? ''} options={[{ value: '', label: 'Workspace collection' }, ...vendors.map(vendor => ({ value: vendor.id, label: vendor.name }))]} /></Field> : null}
              <Field label="Status"><StudioSelectField name="status" defaultValue={editing?.status === 'REJECTED' ? 'DRAFT' : editing?.status ?? 'DRAFT'} options={[{ value: 'DRAFT', label: 'Draft' }, { value: 'PENDING_REVIEW', label: 'Pending review' }, ...(access.permissions.has('approval:review') ? [{ value: 'PUBLISHED', label: 'Published' }, { value: 'PAUSED', label: 'Paused' }] : [])]} /></Field>
              <label className="flex min-h-11 items-center gap-2 rounded-2xl border border-border/60 bg-background/60 px-4 text-xs font-bold"><input type="checkbox" name="active" defaultChecked={editing?.active ?? true} /> Active after publication</label>
              <Field label="Description" className="lg:col-span-3"><textarea name="description" rows={3} defaultValue={editing?.description ?? ''} className={adminFieldClass} /></Field>

              <fieldset className="space-y-3 lg:col-span-3">
                <div>
                  <legend className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Cover gallery and crop</legend>
                  <p className="mt-1 text-[10px] leading-4 text-muted-foreground">Choose any existing Media Studio image. While editing, selecting another image replaces the current cover when you save.</p>
                </div>

                {editing?.coverMediaAsset ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/55 p-3">
                    <div className="size-16 overflow-hidden rounded-xl bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={resolveStudioCroppedMedia(
                          editing.coverMediaAsset.secureUrl,
                          editing.coverMediaAsset.metadata,
                          'collection-cover'
                        ).url}
                        alt=""
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-primary/75">Current cover</p>
                      <p className="mt-1 truncate text-xs font-bold">
                        {editing.coverMediaAsset.displayName ??
                          editing.coverMediaAsset.originalFilename ??
                          'Collection cover'}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">Select another gallery image below to replace it, or choose “Remove current cover”.</p>
                    </div>
                  </div>
                ) : null}

                <MediaChoiceGrid
                  key={editing?.id ?? 'new-collection'}
                  media={media}
                  name="coverMediaAssetId"
                  initialIds={editing?.coverMediaAssetId ? [editing.coverMediaAssetId] : []}
                  emptyLabel={editing?.coverMediaAssetId ? 'Remove current cover' : 'No cover'}
                  purpose="collections"
                  uploadAccept="image"
                  acceptedResourceTypes={['IMAGE']}
                />
              </fieldset>

              <fieldset className="lg:col-span-3">
                <legend className="mb-2 text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Products</legend>
                <StudioProductPicker products={products} initialIds={editing?.products.map(item => item.productId) ?? []} />
              </fieldset>

              <div className="flex flex-wrap gap-3 lg:col-span-3">
                <button className="h-12 rounded-full bg-foreground px-5 text-sm font-bold text-background">{editing ? 'Save collection' : 'Create collection'}</button>
                {editing ? <Link href="/admin/collections" className="h-12 rounded-full px-5 text-sm font-bold leading-[3rem] text-muted-foreground">Cancel editing</Link> : null}
              </div>
            </form>
          </AdminPanel>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {collections.map(collection => {
            const coverUrl = collection.coverMediaAsset
              ? resolveStudioCroppedMedia(
                  collection.coverMediaAsset.secureUrl,
                  collection.coverMediaAsset.metadata,
                  'collection-cover'
                ).url
              : null;

            const linked = collection.products.map(item => {
              const product = item.product;
              const available = product.variants.reduce((sum, variant) => sum + Math.max(0, (variant.inventory?.quantity ?? 0) - (variant.inventory?.reserved ?? 0)), 0);
              return { id: product.id, name: product.name, imageUrl: product.images[0]?.url ?? null, category: product.category.label, vendor: product.vendorProfile?.name ?? null, status: product.status, active: product.active, available, variants: product.variants.length };
            });
            return (
              <article key={collection.id} className="overflow-hidden rounded-[2rem] border border-border/60 bg-card/75 shadow-sm">
                <div className="relative aspect-[9/2] bg-muted">{coverUrl ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={coverUrl} alt="" className="size-full object-cover" /> : <div className="grid size-full place-items-center"><FolderKanban className="size-8 text-muted-foreground" /></div>}<span className="absolute left-3 top-3 rounded-full bg-black/55 px-2 py-1 text-[8px] font-bold text-white">{collection.status.replaceAll('_', ' ')}</span></div>
                <div className="p-5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-primary/70">{collection.layout}</p>
                  <h2 className="mt-2 text-lg font-black">{collection.title}</h2>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{collection.description ?? collection.subtitle ?? 'No collection description yet.'}</p>
                  <StudioProductSummary products={linked} className="mt-4" />
                  <div className="mt-4 flex flex-wrap gap-2">
                    <StudioPreviewDialog title={collection.title} description="Responsive saved collection preview" triggerLabel="Preview"><CollectionPreview title={collection.title} description={collection.description ?? collection.subtitle} cover={coverUrl} products={linked} /></StudioPreviewDialog>
                    {access.permissions.has('collection:manage') ? <><Link href={`/admin/collections?edit=${collection.id}`} className="rounded-full bg-foreground px-3 py-2 text-[9px] font-bold text-background">Edit</Link>{collection.status !== 'PUBLISHED' ? <StatusButton id={collection.id} status="PUBLISHED" label={access.permissions.has('approval:review') ? 'Publish' : 'Submit'} /> : <StatusButton id={collection.id} status="PAUSED" label="Pause" secondary />}<StatusButton id={collection.id} status="ARCHIVED" label="Archive" secondary /></> : null}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </AdminPage>
  );
}

function CollectionPreview({ title, description, cover, products }: { title: string; description: string | null; cover: string | null; products: Awaited<ReturnType<typeof resolveStudioProducts>> }) {
  return (
    <div className="min-h-[42rem] p-5">
      <div className="relative aspect-[9/2] overflow-hidden rounded-3xl bg-muted">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="size-full object-cover" />
        ) : null}
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-2">
            <h2 className="truncate text-xl font-black">{title}</h2>
            <span className="text-xs font-bold text-muted-foreground">
              {products.length} {products.length === 1 ? 'product' : 'products'}
            </span>
          </div>
          {description ? (
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <span className="shrink-0 rounded-full border border-border px-3 py-2 text-[9px] font-bold">
          View Collection
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {products.slice(0, 8).map(product => (
          <div key={product.id} className="overflow-hidden rounded-2xl border">
            <div className="aspect-square bg-muted">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.imageUrl} alt="" className="size-full object-cover" />
              ) : null}
            </div>
            <p className="truncate p-3 text-xs font-bold">{product.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) { return <label className={className}><span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</span>{children}</label>; }
function StatusButton({ id, status, label, secondary = false }: { id: string; status: string; label: string; secondary?: boolean }) { return <form action={setStoreCollectionStatus}><input type="hidden" name="id" value={id} /><input type="hidden" name="status" value={status} /><button className={secondary ? 'rounded-full border border-border px-3 py-2 text-[9px] font-bold' : 'rounded-full bg-foreground px-3 py-2 text-[9px] font-bold text-background'}>{label}</button></form>; }
