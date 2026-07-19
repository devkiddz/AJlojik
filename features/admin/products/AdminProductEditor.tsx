import Link from 'next/link';
import { ArrowLeft, Boxes, CheckCircle2, Save, ShieldCheck, Sparkles } from 'lucide-react';

import { createProduct, updateProduct } from './actions';

type EditorProduct = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  shortDescription: string | null;
  longDescription: string | null;
  estimatedDelivery: string | null;
  tags: string[];
  active: boolean;
  featured: boolean;
  isNew: boolean;
  discountPercentage: number;
} | null;

export default function AdminProductEditor({ product, categories, canManage }: { product: EditorProduct; categories: Array<{ id: string; label: string }>; canManage: boolean }) {
  const editing = Boolean(product);
  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.1),transparent_34%)] px-3 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="rounded-[2rem] border border-border/60 bg-card/80 p-5 shadow-xl sm:p-7">
          <Link href="/admin/products" className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Product command center</Link>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70">Catalog management</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{editing ? `Edit ${product?.name}` : 'Create product'}</h1><p className="mt-2 text-sm text-muted-foreground">Core merchandising details. Variants, media, and inventory remain visible from the product command center.</p></div><span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-2 text-[10px] font-bold text-emerald-600"><ShieldCheck className="size-4" /> Server-authorized writes</span></div>
        </header>

        {!canManage ? <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-700"><strong>Read-only access.</strong> A Manager, Admin, Owner, or Super Admin workspace role is required to save catalog changes.</div> : null}

        <form action={editing ? updateProduct : createProduct} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          {product ? <input type="hidden" name="id" value={product.id} /> : null}
          <div className="space-y-5">
            <EditorCard icon={<Boxes />} title="Product identity" description="Customer-facing title, URL, taxonomy, and descriptions.">
              <div className="grid gap-4 sm:grid-cols-2"><Field label="Product name"><input name="name" required defaultValue={product?.name} className={inputClass} /></Field><Field label="URL slug"><input name="slug" required defaultValue={product?.slug} className={inputClass} /></Field></div>
              <Field label="Category"><select name="categoryId" required defaultValue={product?.categoryId} className={inputClass}><option value="">Select category</option>{categories.map(category => <option key={category.id} value={category.id}>{category.label}</option>)}</select></Field>
              <Field label="Short description"><input name="shortDescription" defaultValue={product?.shortDescription ?? ''} className={inputClass} /></Field>
              <Field label="Long description"><textarea name="longDescription" defaultValue={product?.longDescription ?? ''} rows={6} className={inputClass} /></Field>
            </EditorCard>
            <EditorCard icon={<Sparkles />} title="Commerce details" description="Delivery promise, search tags, and offer treatment.">
              <div className="grid gap-4 sm:grid-cols-2"><Field label="Estimated delivery"><input name="estimatedDelivery" defaultValue={product?.estimatedDelivery ?? ''} placeholder="2–4 business days" className={inputClass} /></Field><Field label="Discount percentage"><input name="discountPercentage" type="number" min="0" max="100" defaultValue={product?.discountPercentage ?? 0} className={inputClass} /></Field></div>
              <Field label="Tags (comma separated)"><input name="tags" defaultValue={product?.tags.join(', ') ?? ''} className={inputClass} /></Field>
            </EditorCard>
          </div>

          <aside className="space-y-5">
            <EditorCard icon={<CheckCircle2 />} title="Publishing" description="Control storefront availability and merchandising signals.">
              <Toggle name="active" label="Active product" description="Visible and purchasable in catalog experiences." defaultChecked={product?.active ?? true} />
              <Toggle name="featured" label="Featured" description="Eligible for premium featured placements." defaultChecked={product?.featured ?? false} />
              <Toggle name="isNew" label="New arrival" description="Show new-product merchandising treatment." defaultChecked={product?.isNew ?? true} />
            </EditorCard>
            <button type="submit" disabled={!canManage} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-sm font-bold text-background shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"><Save className="size-4" /> {editing ? 'Save product' : 'Create product'}</button>
            <p className="text-center text-[10px] leading-5 text-muted-foreground">Changes revalidate the admin catalog and customer storefront.</p>
          </aside>
        </form>
      </div>
    </main>
  );
}

const inputClass = 'min-h-11 w-full rounded-2xl border border-border/70 bg-background/70 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10';
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</span>{children}</label>; }
function EditorCard({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) { return <section className="rounded-[2rem] border border-border/60 bg-card/75 p-5 shadow-lg sm:p-6"><div className="flex gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary [&_svg]:size-4">{icon}</div><div><h2 className="font-bold">{title}</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p></div></div><div className="mt-6 space-y-4">{children}</div></section>; }
function Toggle({ name, label, description, defaultChecked }: { name: string; label: string; description: string; defaultChecked: boolean }) { return <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border/50 bg-background/50 p-3"><input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-1" /><span><strong className="block text-xs">{label}</strong><span className="mt-1 block text-[10px] leading-4 text-muted-foreground">{description}</span></span></label>; }
