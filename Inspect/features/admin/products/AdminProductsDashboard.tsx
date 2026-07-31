'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Boxes,
  ChevronDown,
  CircleDollarSign,
  FileDown,
  Layers3,
  PackagePlus,
  Search,
  Settings2,
  ShoppingBag,
  Sparkles,
  Star
} from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type AdminProductRecord = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  category: string;
  categorySlug: string;
  subcategory: string | null;
  brand: string | null;
  active: boolean;
  featured: boolean;
  isNew: boolean;
  rating: number;
  reviews: number;
  sold: number;
  discount: number;
  updatedAt: string;
  variants: Array<{
    id: string;
    label: string;
    sku: string | null;
    price: number;
    compareAtPrice: number | null;
    active: boolean;
    quantity: number;
    reserved: number;
    reorderLevel: number;
  }>;
};

type Filter = 'all' | 'active' | 'draft' | 'low-stock' | 'out-of-stock' | 'featured';

const money = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat('en-NG', { notation: 'compact', maximumFractionDigits: 1 });

export default function AdminProductsDashboard({ products, operator }: { products: AdminProductRecord[]; operator: { name: string; role: string; workspace: string; mode: string } }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState<string[]>([]);

  const enriched = useMemo(() => products.map(product => {
    const quantity = product.variants.reduce((sum, variant) => sum + variant.quantity, 0);
    const reserved = product.variants.reduce((sum, variant) => sum + variant.reserved, 0);
    const available = Math.max(quantity - reserved, 0);
    const reorderPoint = product.variants.reduce((sum, variant) => sum + variant.reorderLevel, 0);
    const prices = product.variants.map(variant => variant.price);
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;
    const inventoryValue = product.variants.reduce((sum, variant) => sum + Math.max(variant.quantity - variant.reserved, 0) * variant.price, 0);
    return { ...product, quantity, reserved, available, reorderPoint, minPrice, maxPrice, inventoryValue };
  }), [products]);

  const categories = useMemo(() => Array.from(new Set(products.map(product => product.category))).sort(), [products]);
  const filtered = useMemo(() => enriched.filter(product => {
    const term = query.trim().toLowerCase();
    const matchesSearch = !term || [product.name, product.brand, product.category, product.subcategory, ...product.variants.map(variant => variant.sku)].some(value => value?.toLowerCase().includes(term));
    const matchesCategory = category === 'all' || product.category === category;
    const matchesFilter = filter === 'all' ||
      (filter === 'active' && product.active) ||
      (filter === 'draft' && !product.active) ||
      (filter === 'low-stock' && product.available > 0 && product.available <= product.reorderPoint) ||
      (filter === 'out-of-stock' && product.available <= 0) ||
      (filter === 'featured' && product.featured);
    return matchesSearch && matchesCategory && matchesFilter;
  }), [category, enriched, filter, query]);

  const totals = useMemo(() => enriched.reduce((result, product) => ({
    units: result.units + product.available,
    value: result.value + product.inventoryValue,
    variants: result.variants + product.variants.length,
    low: result.low + Number(product.available > 0 && product.available <= product.reorderPoint),
    out: result.out + Number(product.available <= 0)
  }), { units: 0, value: 0, variants: 0, low: 0, out: 0 }), [enriched]);

  const categoryHealth = useMemo(() => categories.map(label => {
    const items = enriched.filter(product => product.category === label);
    return { label, products: items.length, units: items.reduce((sum, item) => sum + item.available, 0), sold: items.reduce((sum, item) => sum + item.sold, 0) };
  }).sort((a, b) => b.sold - a.sold).slice(0, 5), [categories, enriched]);

  const toggleAll = () => setSelected(current => current.length === filtered.length ? [] : filtered.map(product => product.id));
  const toggleProduct = (id: string) => setSelected(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  const exportCatalog = () => {
    const rows = filtered.map(product => [product.id, product.name, product.category, product.variants.length, product.available, product.reserved, product.minPrice, product.maxPrice, product.active ? 'active' : 'draft']);
    const csv = [['id', 'name', 'category', 'variants', 'available', 'reserved', 'min_price', 'max_price', 'status'], ...rows]
      .map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `aj-logik-products-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.09),transparent_32%)] px-3 py-5 sm:px-5 lg:px-7">
      <div className="mx-auto max-w-[100rem] space-y-5">
        <header className="overflow-hidden rounded-[2rem] border border-border/60 bg-card/85 p-5 shadow-xl backdrop-blur sm:p-7">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/70"><span>Commerce admin</span><span>•</span><span>{operator.workspace}</span><span className="rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-600">{operator.mode}</span></div>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Product command center</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Manage a variant-led catalog across pricing, inventory risk, merchandising, and product performance.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={exportCatalog} className="inline-flex h-10 items-center gap-2 rounded-full border border-border/70 bg-background px-4 text-xs font-semibold transition hover:bg-muted"><FileDown className="size-4" /> Export</button>
              <Link href="/admin/products/new" className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-xs font-bold text-background transition hover:opacity-90"><PackagePlus className="size-4" /> Add product</Link>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2"><AdminBadge label="Operator" value={operator.name} /><AdminBadge label="Role" value={operator.role.replaceAll('_', ' ')} /><AdminBadge label="Selected" value={String(selected.length)} /></div>
        </header>

        <section aria-label="Catalog metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Metric icon={<ShoppingBag />} label="Products" value={String(products.length)} detail={`${products.filter(product => product.active).length} active`} tone="violet" />
          <Metric icon={<Layers3 />} label="Variants" value={String(totals.variants)} detail={`${(totals.variants / Math.max(products.length, 1)).toFixed(1)} per product`} tone="blue" />
          <Metric icon={<Boxes />} label="Available units" value={compact.format(totals.units)} detail={`${totals.low} low-stock products`} tone="emerald" />
          <Metric icon={<CircleDollarSign />} label="Inventory value" value={money.format(totals.value)} detail="Available retail value" tone="amber" />
          <Metric icon={<AlertTriangle />} label="Stockouts" value={String(totals.out)} detail={totals.out ? 'Needs attention' : 'Catalog healthy'} tone="rose" />
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(19rem,0.55fr)]">
          <article className="min-w-0 overflow-hidden rounded-[2rem] border border-border/60 bg-card/75 shadow-lg">
            <div className="border-b border-border/60 p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/70">Catalog operations</p><h2 className="mt-1 text-xl font-bold">Products</h2></div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <label className="flex h-10 min-w-0 items-center gap-2 rounded-full border border-border/70 bg-background px-3 sm:min-w-72"><Search className="size-4 text-muted-foreground" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search product, SKU, brand…" className="min-w-0 flex-1 bg-transparent text-xs outline-none" /></label>
                  <Select value={category} onChange={setCategory} options={['all', ...categories]} />
                </div>
              </div>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">{(['all', 'active', 'draft', 'low-stock', 'out-of-stock', 'featured'] as Filter[]).map(item => <button key={item} type="button" onClick={() => setFilter(item)} className={cn('shrink-0 rounded-full px-3 py-2 text-[10px] font-bold capitalize transition', filter === item ? 'bg-foreground text-background' : 'bg-muted/65 text-muted-foreground hover:text-foreground')}>{item.replaceAll('-', ' ')}</button>)}</div>
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[54rem] text-left">
                <thead className="bg-muted/35 text-[9px] uppercase tracking-[0.16em] text-muted-foreground"><tr><th className="w-12 p-4"><input type="checkbox" aria-label="Select all products" checked={filtered.length > 0 && selected.length === filtered.length} onChange={toggleAll} /></th><th className="p-4">Product</th><th className="p-4">Status</th><th className="p-4">Inventory</th><th className="p-4">Price</th><th className="p-4">Performance</th><th className="p-4 text-right">Action</th></tr></thead>
                <tbody>{filtered.map(product => <ProductRow key={product.id} product={product} selected={selected.includes(product.id)} onSelect={() => toggleProduct(product.id)} />)}</tbody>
              </table>
            </div>
            <div className="space-y-3 p-3 md:hidden">{filtered.map(product => <MobileProductCard key={product.id} product={product} selected={selected.includes(product.id)} onSelect={() => toggleProduct(product.id)} />)}</div>
            {!filtered.length ? <div className="grid min-h-64 place-items-center p-8 text-center"><div><Search className="mx-auto size-6 text-muted-foreground" /><p className="mt-3 text-sm font-bold">No products match this view</p><p className="mt-1 text-xs text-muted-foreground">Adjust the search, category, or status filter.</p></div></div> : null}
            <div className="flex items-center justify-between border-t border-border/60 p-4 text-xs text-muted-foreground"><span>{filtered.length} of {products.length} products</span>{selected.length ? <span className="font-semibold text-foreground">{selected.length} ready for bulk workflow</span> : null}</div>
          </article>

          <aside className="space-y-5">
            <InsightCard icon={<AlertTriangle />} eyebrow="Inventory risk" title={`${totals.low + totals.out} products need review`} description="Products at or below their combined reorder thresholds." href="/admin/products?filter=low-stock" action="Review inventory" tone="rose" />
            <article className="rounded-[2rem] border border-border/60 bg-card/75 p-5 shadow-lg">
              <div className="flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/70">Category pulse</p><h2 className="mt-1 text-lg font-bold">Sales mix</h2></div><BarChart3 className="size-5 text-muted-foreground" /></div>
              <div className="mt-5 space-y-4">{categoryHealth.map(item => <div key={item.label}><div className="flex items-center justify-between gap-3 text-xs"><span className="truncate font-semibold">{item.label}</span><span className="text-muted-foreground">{compact.format(item.sold)} sold</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max((item.sold / Math.max(categoryHealth[0]?.sold ?? 1, 1)) * 100, 5)}%` }} /></div><p className="mt-1 text-[9px] text-muted-foreground">{item.products} products · {compact.format(item.units)} units</p></div>)}</div>
            </article>
            <InsightCard icon={<Sparkles />} eyebrow="Merchandising" title={`${products.filter(product => product.featured).length} featured products`} description="Balance homepage visibility with inventory availability and performance." href="/store" action="View storefront" tone="violet" />
          </aside>
        </section>
      </div>
    </main>
  );
}

type EnrichedProduct = AdminProductRecord & { quantity: number; reserved: number; available: number; reorderPoint: number; minPrice: number; maxPrice: number; inventoryValue: number };

function ProductRow({ product, selected, onSelect }: { product: EnrichedProduct; selected: boolean; onSelect: () => void }) {
  return <tr className="border-t border-border/50 transition hover:bg-muted/25"><td className="p-4"><input type="checkbox" aria-label={`Select ${product.name}`} checked={selected} onChange={onSelect} /></td><td className="p-4"><ProductIdentity product={product} /></td><td className="p-4"><Status product={product} /></td><td className="p-4"><Stock product={product} /></td><td className="p-4"><p className="text-xs font-bold">{priceRange(product)}</p><p className="mt-1 text-[9px] text-muted-foreground">{product.variants.length} variants</p></td><td className="p-4"><p className="text-xs font-bold">{compact.format(product.sold)} sold</p><p className="mt-1 flex items-center gap-1 text-[9px] text-muted-foreground"><Star className="size-3 fill-amber-400 text-amber-400" /> {product.rating.toFixed(1)} · {product.reviews} reviews</p></td><td className="p-4 text-right"><Link href={`/admin/products/${product.id}`} className="inline-flex size-9 items-center justify-center rounded-full border border-border/70 transition hover:bg-foreground hover:text-background"><Settings2 className="size-4" /></Link></td></tr>;
}

function MobileProductCard({ product, selected, onSelect }: { product: EnrichedProduct; selected: boolean; onSelect: () => void }) {
  return <article className={cn('rounded-3xl border bg-background/65 p-3 transition', selected ? 'border-primary ring-2 ring-primary/10' : 'border-border/60')}><div className="flex gap-3"><input type="checkbox" aria-label={`Select ${product.name}`} checked={selected} onChange={onSelect} className="mt-4" /><ProductIdentity product={product} /><Link href={`/admin/products/${product.id}`} className="grid size-9 shrink-0 place-items-center rounded-full border border-border/60"><ArrowRight className="size-4" /></Link></div><div className="mt-3 grid grid-cols-3 gap-2 rounded-2xl bg-muted/40 p-3"><MiniStat label="Available" value={String(product.available)} /><MiniStat label="Variants" value={String(product.variants.length)} /><MiniStat label="Sold" value={compact.format(product.sold)} /></div><div className="mt-3 flex items-center justify-between"><Status product={product} /><span className="text-xs font-bold">{priceRange(product)}</span></div></article>;
}

function ProductIdentity({ product }: { product: EnrichedProduct }) {
  return <div className="flex min-w-0 items-center gap-3"><div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-muted">{product.image ? <Image src={product.image} alt={product.name} fill sizes="48px" className="object-cover" /> : <ShoppingBag className="absolute inset-0 m-auto size-5 text-muted-foreground" />}</div><div className="min-w-0"><p className="max-w-52 truncate text-xs font-bold">{product.name}</p><p className="mt-1 truncate text-[9px] text-muted-foreground">{product.brand ?? product.category}{product.subcategory ? ` · ${product.subcategory}` : ''}</p>{product.featured || product.isNew ? <div className="mt-1 flex gap-1">{product.featured ? <TinyBadge>Featured</TinyBadge> : null}{product.isNew ? <TinyBadge>New</TinyBadge> : null}</div> : null}</div></div>;
}

function Status({ product }: { product: EnrichedProduct }) {
  if (!product.active) return <Pill className="bg-muted text-muted-foreground">Draft</Pill>;
  if (product.available <= 0) return <Pill className="bg-rose-500/10 text-rose-600">Out of stock</Pill>;
  if (product.available <= product.reorderPoint) return <Pill className="bg-amber-500/10 text-amber-600">Low stock</Pill>;
  return <Pill className="bg-emerald-500/10 text-emerald-600">Active</Pill>;
}

function Stock({ product }: { product: EnrichedProduct }) {
  return <div><p className="text-xs font-bold">{product.available} available</p><p className="mt-1 text-[9px] text-muted-foreground">{product.reserved} reserved · reorder {product.reorderPoint}</p></div>;
}

function priceRange(product: EnrichedProduct) { return product.minPrice === product.maxPrice ? money.format(product.minPrice) : `${money.format(product.minPrice)}–${money.format(product.maxPrice)}`; }
function Pill({ children, className }: { children: ReactNode; className: string }) { return <span className={cn('inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold', className)}>{children}</span>; }
function TinyBadge({ children }: { children: ReactNode }) { return <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[8px] font-bold text-primary">{children}</span>; }
function MiniStat({ label, value }: { label: string; value: string }) { return <div><p className="text-[8px] text-muted-foreground">{label}</p><p className="mt-1 text-xs font-bold">{value}</p></div>; }

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return <label className="relative"><select value={value} onChange={event => onChange(event.target.value)} className="h-10 w-full appearance-none rounded-full border border-border/70 bg-background px-4 pr-9 text-xs font-semibold outline-none sm:w-44">{options.map(option => <option key={option} value={option}>{option === 'all' ? 'All categories' : option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 text-muted-foreground" /></label>;
}

type Tone = 'violet' | 'blue' | 'emerald' | 'amber' | 'rose';
const tones: Record<Tone, string> = { violet: 'bg-violet-500/10 text-violet-600', blue: 'bg-blue-500/10 text-blue-600', emerald: 'bg-emerald-500/10 text-emerald-600', amber: 'bg-amber-500/10 text-amber-600', rose: 'bg-rose-500/10 text-rose-600' };
function Metric({ icon, label, value, detail, tone }: { icon: ReactNode; label: string; value: string; detail: string; tone: Tone }) { return <article className="rounded-3xl border border-border/60 bg-card/75 p-5 shadow-sm"><div className={cn('grid size-10 place-items-center rounded-2xl [&_svg]:size-4', tones[tone])}>{icon}</div><p className="mt-5 text-[10px] text-muted-foreground">{label}</p><p className="mt-1 truncate text-2xl font-black tracking-tight">{value}</p><p className="mt-2 truncate text-[9px] text-muted-foreground">{detail}</p></article>; }
function AdminBadge({ label, value }: { label: string; value: string }) { return <span className="rounded-full border border-border/60 bg-background/65 px-3 py-2 text-[10px]"><span className="text-muted-foreground">{label}</span><strong className="ml-2 uppercase">{value}</strong></span>; }
function InsightCard({ icon, eyebrow, title, description, href, action, tone }: { icon: ReactNode; eyebrow: string; title: string; description: string; href: string; action: string; tone: Tone }) { return <article className="rounded-[2rem] border border-border/60 bg-card/75 p-5 shadow-lg"><div className={cn('grid size-11 place-items-center rounded-2xl [&_svg]:size-5', tones[tone])}>{icon}</div><p className="mt-5 text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p><h2 className="mt-1 text-xl font-black tracking-tight">{title}</h2><p className="mt-2 text-xs leading-5 text-muted-foreground">{description}</p><Link href={href} className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-primary">{action}<ArrowRight className="size-3.5" /></Link></article>; }
