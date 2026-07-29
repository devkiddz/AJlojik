import Link from 'next/link';
import { FolderKanban, Grid3X3, ImageIcon, Layers3 } from 'lucide-react';

import { getAdminAccess } from '@/features/admin/auth/adminPermissions';
import { AdminMetric, AdminPage, AdminPageHeader, AdminPanel, adminFieldClass } from '@/features/admin/components';
import { saveStoreCollection, setStoreCollectionStatus } from '@/features/admin/collections/actions';
import { MediaChoiceGrid } from '@/features/admin/media';
import { prisma } from '@/lib/prisma';

function datetime(value: Date | null | undefined) {
  if (!value) return '';
  const offset = value.getTimezoneOffset();
  return new Date(value.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

export default async function AdminCollectionsPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const access = await getAdminAccess();
  if (!access.permissions.has('collection:view')) throw new Error('Collection Studio access is required.');
  const { edit } = await searchParams;
  const workspaceId = access.membership.workspaceId;

  const [collections, products, media, vendors, editing] = await Promise.all([
    prisma.storeCollection.findMany({
      where: { workspaceId, status: { not: 'ARCHIVED' } },
      include: { coverMediaAsset: true, vendorProfile: { select: { name: true } }, products: true },
      orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }]
    }),
    prisma.product.findMany({ where: { workspaceId, status: 'PUBLISHED' }, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.mediaAsset.findMany({ where: { workspaceId, status: 'ACTIVE', resourceType: 'IMAGE' }, orderBy: { createdAt: 'desc' }, take: 150 }),
    access.membership.workspace.commerceMode === 'MULTI_VENDOR'
      ? prisma.vendorProfile.findMany({ where: { workspaceId, status: 'ACTIVE', active: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } })
      : Promise.resolve([]),
    edit ? prisma.storeCollection.findFirst({ where: { id: edit, workspaceId }, include: { products: true } }) : null
  ]);

  const published = collections.filter(item => item.status === 'PUBLISHED').length;
  const pending = collections.filter(item => item.status === 'PENDING_REVIEW').length;

  return (
    <AdminPage>
      <div className="mx-auto max-w-[96rem] space-y-5">
        <AdminPageHeader eyebrow="Merchandising Studio" title="Collection Studio" description="Create, edit and publish reusable product stories using visual Media Studio galleries." />
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AdminMetric icon={FolderKanban} label="Collections" value={collections.length} />
          <AdminMetric icon={Grid3X3} label="Published" value={published} />
          <AdminMetric icon={Layers3} label="Awaiting review" value={pending} />
          <AdminMetric icon={ImageIcon} label="Available covers" value={media.length} />
        </section>

        {access.permissions.has('collection:manage') ? (
          <AdminPanel title={editing ? `Edit ${editing.title}` : 'Create collection'} description="The visual cover is selected from Media Studio; no copied media URL is required.">
            <form action={saveStoreCollection} className="grid gap-4 lg:grid-cols-3">
              {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
              <Field label="Title"><input name="title" defaultValue={editing?.title} required className={adminFieldClass} /></Field>
              <Field label="Slug"><input name="slug" defaultValue={editing?.slug} className={adminFieldClass} /></Field>
              <Field label="Layout"><select name="layout" defaultValue={editing?.layout ?? 'CAROUSEL'} className={adminFieldClass}><option value="CAROUSEL">Carousel</option><option value="FEATURED">Featured</option><option value="GRID">Grid</option><option value="SPOTLIGHT">Spotlight</option></select></Field>
              <Field label="Subtitle"><input name="subtitle" defaultValue={editing?.subtitle ?? ''} className={adminFieldClass} /></Field>
              <Field label="Featured product"><select name="featuredProductId" defaultValue={editing?.featuredProductId ?? ''} className={adminFieldClass}><option value="">No featured product</option>{products.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}</select></Field>
              <Field label="Priority"><input name="priority" type="number" defaultValue={editing?.priority ?? 0} className={adminFieldClass} /></Field>
              <Field label="Starts"><input name="startsAt" type="datetime-local" defaultValue={datetime(editing?.startsAt)} className={adminFieldClass} /></Field>
              <Field label="Ends"><input name="endsAt" type="datetime-local" defaultValue={datetime(editing?.endsAt)} className={adminFieldClass} /></Field>
              {vendors.length ? <Field label="Vendor owner"><select name="vendorProfileId" defaultValue={editing?.vendorProfileId ?? ''} className={adminFieldClass}><option value="">Workspace collection</option>{vendors.map(vendor => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}</select></Field> : null}
              <Field label="Status"><select name="status" defaultValue={editing?.status === 'REJECTED' ? 'DRAFT' : editing?.status ?? 'DRAFT'} className={adminFieldClass}><option value="DRAFT">Draft</option><option value="PENDING_REVIEW">Pending review</option>{access.permissions.has('approval:review') ? <><option value="PUBLISHED">Published</option><option value="PAUSED">Paused</option></> : null}</select></Field>
              <label className="flex min-h-11 items-center gap-2 rounded-2xl border border-border/60 bg-background/60 px-4 text-xs font-bold"><input type="checkbox" name="active" defaultChecked={editing?.active ?? true} /> Active after publication</label>
              <Field label="Description" className="lg:col-span-3"><textarea name="description" rows={3} defaultValue={editing?.description ?? ''} className={adminFieldClass} /></Field>
              <fieldset className="lg:col-span-3"><legend className="mb-2 text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Cover gallery</legend><MediaChoiceGrid media={media} name="coverMediaAssetId" initialIds={editing?.coverMediaAssetId ? [editing.coverMediaAssetId] : []} emptyLabel="No cover" purpose="collections" uploadAccept="image" acceptedResourceTypes={['IMAGE']} /></fieldset>
              <fieldset className="lg:col-span-3"><legend className="mb-2 text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Products</legend><div className="grid max-h-64 gap-2 overflow-y-auto rounded-3xl border border-border/60 bg-background/50 p-3 sm:grid-cols-2 lg:grid-cols-3">{products.map(product => <label key={product.id} className="flex items-center gap-2 rounded-xl p-2 text-xs hover:bg-muted"><input type="checkbox" name="productIds" value={product.id} defaultChecked={editing?.products.some(item => item.productId === product.id)} /><span className="truncate">{product.name}</span></label>)}</div></fieldset>
              <div className="flex flex-wrap gap-3 lg:col-span-3"><button className="h-12 rounded-full bg-foreground px-5 text-sm font-bold text-background">{editing ? 'Save collection' : 'Create collection'}</button>{editing ? <Link href="/admin/collections" className="h-12 rounded-full px-5 text-sm font-bold leading-[3rem] text-muted-foreground">Cancel editing</Link> : null}</div>
            </form>
          </AdminPanel>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {collections.map(collection => <article key={collection.id} className="overflow-hidden rounded-[2rem] border border-border/60 bg-card/75 shadow-sm"><div className="relative aspect-[16/8] bg-muted">{collection.coverMediaAsset ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={collection.coverMediaAsset.secureUrl} alt="" className="size-full object-cover" /> : <div className="grid size-full place-items-center"><FolderKanban className="size-8 text-muted-foreground" /></div>}<span className="absolute left-3 top-3 rounded-full bg-black/55 px-2 py-1 text-[8px] font-bold text-white">{collection.status.replaceAll('_', ' ')}</span></div><div className="p-5"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-primary/70">{collection.layout} · {collection.products.length} products</p><h2 className="mt-2 text-lg font-black">{collection.title}</h2><p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{collection.description ?? collection.subtitle ?? 'No collection description yet.'}</p>{collection.vendorProfile ? <p className="mt-3 text-[9px] font-bold">Vendor: {collection.vendorProfile.name}</p> : null}{access.permissions.has('collection:manage') ? <div className="mt-4 flex flex-wrap gap-2"><Link href={`/admin/collections?edit=${collection.id}`} className="rounded-full bg-foreground px-3 py-2 text-[9px] font-bold text-background">Edit</Link>{collection.status !== 'PUBLISHED' ? <StatusButton id={collection.id} status="PUBLISHED" label={access.permissions.has('approval:review') ? 'Publish' : 'Submit'} /> : <StatusButton id={collection.id} status="PAUSED" label="Pause" secondary />}<StatusButton id={collection.id} status="ARCHIVED" label="Archive" secondary /></div> : null}</div></article>)}
        </section>
      </div>
    </AdminPage>
  );
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) { return <label className={className}><span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</span>{children}</label>; }
function StatusButton({ id, status, label, secondary = false }: { id: string; status: string; label: string; secondary?: boolean }) { return <form action={setStoreCollectionStatus}><input type="hidden" name="id" value={id} /><input type="hidden" name="status" value={status} /><button className={secondary ? 'rounded-full border border-border px-3 py-2 text-[9px] font-bold' : 'rounded-full bg-foreground px-3 py-2 text-[9px] font-bold text-background'}>{label}</button></form>; }
