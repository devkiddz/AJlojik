import Link from 'next/link';
import { BadgePercent, CalendarClock, ImageIcon, Tags } from 'lucide-react';

import { getAdminAccess } from '@/features/admin/auth/adminPermissions';
import { AdminMetric, AdminPage, AdminPageHeader, AdminPanel, adminFieldClass } from '@/features/admin/components';
import { MediaChoiceGrid } from '@/features/admin/media';
import { savePromotion, setPromotionStatus } from '@/features/admin/promotions/actions';
import { StudioPreviewDialog, StudioProductPicker, StudioProductSummary, StudioSelectField } from '@/features/studio-controls';
import { resolveStudioProducts } from '@/features/studio-controls/server/resolveStudioProducts';
import { prisma } from '@/lib/prisma';

function datetime(value: Date | null | undefined) { if (!value) return ''; const offset = value.getTimezoneOffset(); return new Date(value.getTime() - offset * 60_000).toISOString().slice(0, 16); }

export default async function AdminPromotionsPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const access = await getAdminAccess();
  if (!access.permissions.has('promotion:view')) throw new Error('Promotion Studio access is required.');
  const { edit } = await searchParams;
  const workspaceId = access.membership.workspaceId;
  const [promotions, products, media, vendors, editing] = await Promise.all([
    prisma.promotion.findMany({
      where: { workspaceId, status: { not: 'ARCHIVED' } },
      include: {
        bannerMediaAsset: true,
        vendorProfile: { select: { name: true } },
        products: {
          orderBy: { position: 'asc' },
          include: {
            product: {
              select: {
                id: true, name: true, status: true, active: true,
                category: { select: { label: true } },
                vendorProfile: { select: { name: true } },
                images: { orderBy: [{ primary: 'desc' }, { position: 'asc' }], take: 1, select: { url: true } },
                variants: { where: { active: true }, include: { inventory: true } }
              }
            }
          }
        }
      },
      orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }]
    }),
    resolveStudioProducts({ workspaceId }),
    prisma.mediaAsset.findMany({ where: { workspaceId, status: 'ACTIVE', resourceType: 'IMAGE' }, orderBy: { createdAt: 'desc' }, take: 150 }),
    access.membership.workspace.commerceMode === 'MULTI_VENDOR'
      ? prisma.vendorProfile.findMany({ where: { workspaceId, status: 'ACTIVE', active: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } })
      : Promise.resolve([]),
    edit ? prisma.promotion.findFirst({ where: { id: edit, workspaceId }, include: { products: true } }) : null
  ]);

  const active = promotions.filter(item => item.status === 'PUBLISHED' && item.active).length;
  const scheduled = promotions.filter(item => item.startsAt && item.startsAt > new Date()).length;

  return (
    <AdminPage>
      <div className="mx-auto max-w-[96rem] space-y-5">
        <AdminPageHeader eyebrow="Offer management" title="Promotion Studio" description="Build image-rich offers with searchable product selection, crop-aware media and responsive saved-state previews." />
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AdminMetric icon={BadgePercent} label="Promotions" value={promotions.length} />
          <AdminMetric icon={Tags} label="Active" value={active} />
          <AdminMetric icon={CalendarClock} label="Scheduled" value={scheduled} />
          <AdminMetric icon={ImageIcon} label="Banner assets" value={media.length} />
        </section>

        {access.permissions.has('promotion:manage') ? (
          <AdminPanel title={editing ? `Edit ${editing.title}` : 'Create promotion'} description="Select the banner and eligible products visually; product counts and availability remain visible before saving.">
            <form action={savePromotion} className="grid gap-4 lg:grid-cols-3">
              {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
              <Field label="Title"><input name="title" defaultValue={editing?.title} required className={adminFieldClass} /></Field>
              <Field label="Slug"><input name="slug" defaultValue={editing?.slug} className={adminFieldClass} /></Field>
              <Field label="Type"><StudioSelectField name="type" defaultValue={editing?.type ?? 'PERCENTAGE'} options={[{ value: 'PERCENTAGE', label: 'Percentage discount' }, { value: 'FIXED_AMOUNT', label: 'Fixed amount' }, { value: 'FIXED_PRICE', label: 'Fixed product price' }, { value: 'FEATURED', label: 'Featured campaign' }]} /></Field>
              <Field label="Discount value"><input name="discountValue" type="number" min="0" step="0.01" defaultValue={editing?.discountValue === null || editing?.discountValue === undefined ? '' : Number(editing.discountValue)} className={adminFieldClass} /></Field>
              <Field label="Code"><input name="code" defaultValue={editing?.code ?? ''} className={adminFieldClass} /></Field>
              <Field label="Usage limit"><input name="usageLimit" type="number" min="0" defaultValue={editing?.usageLimit ?? ''} className={adminFieldClass} /></Field>
              <Field label="Starts"><input name="startsAt" type="datetime-local" defaultValue={datetime(editing?.startsAt)} className={adminFieldClass} /></Field>
              <Field label="Ends"><input name="endsAt" type="datetime-local" defaultValue={datetime(editing?.endsAt)} className={adminFieldClass} /></Field>
              <Field label="Priority"><input name="priority" type="number" defaultValue={editing?.priority ?? 0} className={adminFieldClass} /></Field>
              {vendors.length ? <Field label="Vendor owner"><StudioSelectField name="vendorProfileId" defaultValue={editing?.vendorProfileId ?? ''} options={[{ value: '', label: 'Workspace promotion' }, ...vendors.map(vendor => ({ value: vendor.id, label: vendor.name }))]} /></Field> : null}
              <Field label="Status"><StudioSelectField name="status" defaultValue={editing?.status === 'REJECTED' ? 'DRAFT' : editing?.status ?? 'DRAFT'} options={[{ value: 'DRAFT', label: 'Draft' }, { value: 'PENDING_REVIEW', label: 'Pending review' }, ...(access.permissions.has('approval:review') ? [{ value: 'PUBLISHED', label: 'Published' }, { value: 'PAUSED', label: 'Paused' }] : [])]} /></Field>
              <label className="flex min-h-11 items-center gap-2 rounded-2xl border border-border/60 bg-background/60 px-4 text-xs font-bold"><input type="checkbox" name="active" defaultChecked={editing?.active ?? true} /> Active after publication</label>
              <Field label="Description" className="lg:col-span-3"><textarea name="description" rows={3} defaultValue={editing?.description ?? ''} className={adminFieldClass} /></Field>
              <fieldset className="lg:col-span-3"><legend className="mb-2 text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Banner gallery and crop</legend><MediaChoiceGrid media={media} name="bannerMediaAssetId" initialIds={editing?.bannerMediaAssetId ? [editing.bannerMediaAssetId] : []} emptyLabel="No banner" purpose="promotions" uploadAccept="image" acceptedResourceTypes={['IMAGE']} /></fieldset>
              <fieldset className="lg:col-span-3"><legend className="mb-2 text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Eligible products</legend><StudioProductPicker products={products} initialIds={editing?.products.map(item => item.productId) ?? []} /></fieldset>
              <div className="flex flex-wrap gap-3 lg:col-span-3"><button className="h-12 rounded-full bg-foreground px-5 text-sm font-bold text-background">{editing ? 'Save promotion' : 'Create promotion'}</button>{editing ? <Link href="/admin/promotions" className="h-12 rounded-full px-5 text-sm font-bold leading-[3rem] text-muted-foreground">Cancel editing</Link> : null}</div>
            </form>
          </AdminPanel>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {promotions.map(promotion => {
            const linked = promotion.products.map(item => {
              const product = item.product;
              const available = product.variants.reduce((sum, variant) => sum + Math.max(0, (variant.inventory?.quantity ?? 0) - (variant.inventory?.reserved ?? 0)), 0);
              return { id: product.id, name: product.name, imageUrl: product.images[0]?.url ?? null, category: product.category.label, vendor: product.vendorProfile?.name ?? null, status: product.status, active: product.active, available, variants: product.variants.length };
            });
            return (
              <article key={promotion.id} className="overflow-hidden rounded-[2rem] border border-border/60 bg-card/75 shadow-sm">
                <div className="relative aspect-[16/8] bg-muted">{promotion.bannerMediaAsset ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={promotion.bannerMediaAsset.secureUrl} alt="" className="size-full object-cover" /> : <div className="grid size-full place-items-center"><BadgePercent className="size-8 text-muted-foreground" /></div>}<span className="absolute left-3 top-3 rounded-full bg-black/55 px-2 py-1 text-[8px] font-bold text-white">{promotion.status.replaceAll('_', ' ')}</span></div>
                <div className="p-5"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-primary/70">{promotion.type.replaceAll('_', ' ')}</p><h2 className="mt-2 text-lg font-black">{promotion.title}</h2><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{promotion.description ?? 'No promotion description yet.'}</p><StudioProductSummary products={linked} className="mt-4" />
                  <div className="mt-4 flex flex-wrap gap-2"><StudioPreviewDialog title={promotion.title} description="Responsive saved promotion preview" triggerLabel="Preview"><PromotionPreview title={promotion.title} description={promotion.description} banner={promotion.bannerMediaAsset?.secureUrl ?? null} products={linked} /></StudioPreviewDialog>{access.permissions.has('promotion:manage') ? <><Link href={`/admin/promotions?edit=${promotion.id}`} className="rounded-full bg-foreground px-3 py-2 text-[9px] font-bold text-background">Edit</Link>{promotion.status !== 'PUBLISHED' ? <Status id={promotion.id} status="PUBLISHED" label={access.permissions.has('approval:review') ? 'Publish' : 'Submit'} /> : <Status id={promotion.id} status="PAUSED" label="Pause" secondary />}<Status id={promotion.id} status="ARCHIVED" label="Archive" secondary /></> : null}</div>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </AdminPage>
  );
}

function PromotionPreview({ title, description, banner, products }: { title: string; description: string | null; banner: string | null; products: Awaited<ReturnType<typeof resolveStudioProducts>> }) { return <div className="min-h-[42rem] p-5"><div className="relative aspect-[16/7] overflow-hidden rounded-3xl bg-muted">{banner ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={banner} alt="" className="size-full object-cover" /> : null}<div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-6 text-white"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/65">Promotion</p><h2 className="mt-2 text-3xl font-black">{title}</h2><p className="mt-2 max-w-2xl text-sm text-white/70">{description}</p></div></div><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{products.slice(0, 8).map(product => <div key={product.id} className="overflow-hidden rounded-2xl border"><div className="aspect-square bg-muted">{product.imageUrl ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={product.imageUrl} alt="" className="size-full object-cover" /> : null}</div><p className="truncate p-3 text-xs font-bold">{product.name}</p></div>)}</div></div>; }
function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) { return <label className={className}><span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</span>{children}</label>; }
function Status({ id, status, label, secondary = false }: { id: string; status: string; label: string; secondary?: boolean }) { return <form action={setPromotionStatus}><input type="hidden" name="id" value={id} /><input type="hidden" name="status" value={status} /><button className={secondary ? 'rounded-full border border-border px-3 py-2 text-[9px] font-bold' : 'rounded-full bg-foreground px-3 py-2 text-[9px] font-bold text-background'}>{label}</button></form>; }
