'use client';

import { useMemo, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ArrowRight, ChevronRight, Headphones, LoaderCircle, ShieldCheck, Sparkles, Truck } from 'lucide-react';

import { categories } from '@/data/categories';
import { useCart } from '@/features/cart';
import { useCatalog } from '@/features/catalog';
import { ProductCard } from '@/features/products/cards';
import { RegularProductPreviewModal } from '@/features/products/modals';

import type { ProductType, ProductVariantType } from '@/types/types';

const currency = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });

export default function HomeStorefront() {
  const router = useRouter();
  const { products, loading, error } = useCatalog();
  const { addToCart } = useCart();
  const [previewProduct, setPreviewProduct] = useState<ProductType | null>(null);

  const featured = useMemo(
    () => products.find(product => product.featured && product.variants.some(variant => variant.stockLeft > 0)) ?? products[0] ?? null,
    [products]
  );
  const trending = useMemo(() => [...products].sort((a, b) => b.soldCount - a.soldCount).slice(0, 8), [products]);
  const newProducts = useMemo(() => products.filter(product => product.isNew).slice(0, 8), [products]);
  const recommendations = useMemo(() => [...products].sort((a, b) => b.rating - a.rating).slice(0, 8), [products]);
  const featuredVariant = featured?.variants.find(variant => variant.stockLeft > 0) ?? featured?.variants[0];

  const addProduct = (product: ProductType, variant: ProductVariantType) => {
    void addToCart({ product, variant, quantity: 1 });
  };

  if (loading) {
    return <div className="grid min-h-[65vh] place-items-center"><LoaderCircle className="size-7 animate-spin text-primary" /></div>;
  }

  if (error || !featured || !featuredVariant) {
    return <div className="grid min-h-[55vh] place-items-center px-6 text-center text-sm text-muted-foreground">{error ?? 'The store is preparing today’s selection.'}</div>;
  }

  const openProduct = (product: ProductType) => router.push(`/products/${product.slug}`);

  return (
    <div className="bg-background pb-14">
      <section className="w-full">
        <div className="grid min-h-[72dvh] overflow-hidden bg-[#07172b] text-white shadow-2xl lg:grid-cols-[.9fr_1.1fr]">
          <div className="relative z-10 flex min-h-[34rem] flex-col justify-center p-7 sm:p-12 lg:min-h-[72dvh] lg:p-16 xl:p-24">
            <div className="absolute -left-32 top-0 size-96 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.16em] backdrop-blur">
                <Sparkles className="size-3.5 text-amber-300" /> Recommended experience
              </span>
              <h1 className="mt-6 max-w-2xl text-4xl font-black leading-[.98] tracking-[-.045em] sm:text-6xl xl:text-7xl">Make every moment feel considered.</h1>
              <p className="mt-5 max-w-xl text-sm leading-6 text-white/70 sm:text-base">Discover products, event essentials, and premium picks selected around how you shop—not just what is popular.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={`/products/${featured.slug}`} className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-black text-[#07172b] transition hover:bg-white/90">Shop featured <ArrowRight className="size-4" /></Link>
                <Link href="/store" className="inline-flex items-center gap-2 rounded-md border border-white/25 bg-white/5 px-5 py-3 text-sm font-bold transition hover:bg-white/10">Explore store</Link>
              </div>
            </div>
          </div>

          <Link href={`/products/${featured.slug}`} className="group relative min-h-[32rem] overflow-hidden lg:min-h-[72dvh]">
            <Image src={featuredVariant.image} alt={featured.name} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover transition duration-700 group-hover:scale-[1.035]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-transparent lg:bg-gradient-to-r lg:from-[#07172b]/35 lg:via-transparent lg:to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-amber-300">Featured today</p>
              <h2 className="mt-2 max-w-lg text-2xl font-black sm:text-3xl">{featured.name}</h2>
              <p className="mt-2 text-sm text-white/70">From {currency.format(featuredVariant.price)}</p>
            </div>
          </Link>
        </div>
      </section>

      <div className="relative z-10 -mt-10 rounded-t-[2rem] bg-background pt-1">
        <ProductRail title="Most active experiences" subtitle="The products customers are exploring and choosing now" products={trending} onOpen={openProduct} onPreview={setPreviewProduct} onAdd={addProduct} />
      </div>

      <section className="mx-auto mt-8 w-full max-w-[1500px] px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.slice(0, 6).map(category => (
            <Link key={category.id} href={`/store?category=${category.slug}`} className="group flex min-h-24 flex-col items-center justify-center rounded-2xl border border-border/55 bg-card px-3 py-4 text-center shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
              <Image src={category.image} alt="" width={44} height={44} className="size-11 rounded-xl object-cover transition group-hover:scale-105" />
              <span className="mt-2 line-clamp-1 text-xs font-bold">{category.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-10 grid w-full max-w-[1500px] gap-4 px-4 sm:px-6 lg:grid-cols-2">
        <PromoTile product={recommendations[0] ?? featured} eyebrow="Curated for you" title="Premium picks, without the noise" tone="dark" />
        <PromoTile product={newProducts[0] ?? trending[1] ?? featured} eyebrow="Fresh arrivals" title="Meet what’s new in the store" tone="light" />
      </section>

      {newProducts.length ? <ProductRail title="New and noteworthy" subtitle="Fresh additions worth discovering" products={newProducts} onOpen={openProduct} onPreview={setPreviewProduct} onAdd={addProduct} /> : null}
      <ProductRail title="Recommended for your next moment" subtitle="Highly rated selections across the store" products={recommendations} onOpen={openProduct} onPreview={setPreviewProduct} onAdd={addProduct} />

      <section className="mx-auto mt-12 grid w-full max-w-[1500px] gap-3 px-4 sm:grid-cols-3 sm:px-6">
        <TrustCard icon={<Truck />} title="Flexible delivery" text="AJ Delivery, pickup, or your approved personal dispatcher." />
        <TrustCard icon={<ShieldCheck />} title="Protected shopping" text="Secure account actions, live inventory, and verified tracking." />
        <TrustCard icon={<Headphones />} title="Human support" text="Premium assistance before, during, and after every order." />
      </section>

      <RegularProductPreviewModal product={previewProduct} open={Boolean(previewProduct)} onClose={() => setPreviewProduct(null)} onAddToCart={addProduct} />
    </div>
  );
}

function ProductRail({ title, subtitle, products, onOpen, onPreview, onAdd }: { title: string; subtitle: string; products: ProductType[]; onOpen: (product: ProductType) => void; onPreview: (product: ProductType) => void; onAdd: (product: ProductType, variant: ProductVariantType) => void }) {
  if (!products.length) return null;
  return (
    <section className="mx-auto mt-12 w-full max-w-[1500px] px-4 sm:px-6">
      <header className="mb-5 flex items-end justify-between gap-4">
        <div><h2 className="text-2xl font-black tracking-tight sm:text-3xl">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{subtitle}</p></div>
        <Link href="/store" className="hidden items-center gap-1 text-sm font-bold hover:underline sm:inline-flex">See all <ChevronRight className="size-4" /></Link>
      </header>
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-5 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-4 xl:grid-cols-5">
        {products.slice(0, 5).map(product => <ProductCard key={product.id} product={product} onOpenExperience={onOpen} onPreview={onPreview} onAddToCart={onAdd} className="w-[72vw] max-w-[265px] shrink-0 snap-start sm:w-auto sm:max-w-none" />)}
      </div>
    </section>
  );
}

function PromoTile({ product, eyebrow, title, tone }: { product: ProductType; eyebrow: string; title: string; tone: 'dark' | 'light' }) {
  const variant = product.variants[0];
  if (!variant) return null;
  return (
    <Link href={`/products/${product.slug}`} className={`group relative min-h-80 overflow-hidden rounded-[1.75rem] border border-border/50 ${tone === 'dark' ? 'bg-slate-950 text-white' : 'bg-stone-100 text-slate-950'}`}>
      <Image src={variant.image} alt="" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" />
      <div className={`absolute inset-0 ${tone === 'dark' ? 'bg-gradient-to-r from-black/90 via-black/55 to-transparent' : 'bg-gradient-to-r from-white/95 via-white/65 to-transparent'}`} />
      <div className="absolute inset-y-0 left-0 flex max-w-[70%] flex-col justify-center p-7 sm:p-10">
        <p className="text-xs font-black uppercase tracking-[.17em]">{eyebrow}</p><h3 className="mt-3 text-3xl font-black leading-tight">{title}</h3><span className="mt-6 inline-flex w-fit items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-xs font-black text-primary-foreground">Shop now <ArrowRight className="size-4" /></span>
      </div>
    </Link>
  );
}

function TrustCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <article className="flex gap-4 rounded-2xl border border-border/55 bg-card p-5"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">{icon}</span><div><h3 className="text-sm font-black">{title}</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p></div></article>;
}
