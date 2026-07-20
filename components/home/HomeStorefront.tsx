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
import HeroBackgroundMedia from './HeroBackgroundMedia';

import type { ProductType, ProductVariantType } from '@/types/types';

const currency = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });
const DEFAULT_HERO_VIDEO = 'https://www.youtube.com/watch?v=WN_fa23hasc';
const DEFAULT_HERO_IMAGE = 'https://images.unsplash.com/photo-1575444758702-4a6b9222336e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

type StorefrontHeroConfig = { mediaType: string; mediaUrl: string | null; posterUrl: string | null; eyebrow: string; title: string; summary: string | null; primaryLabel: string; primaryHref: string; secondaryLabel: string; secondaryHref: string; autoplay: boolean } | null;

export default function HomeStorefront({ hero }: { hero: StorefrontHeroConfig }) {
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
  const heroMedia = hero?.mediaUrl || DEFAULT_HERO_VIDEO;
  const heroFallbackImage = hero?.posterUrl || DEFAULT_HERO_IMAGE || featuredVariant?.image;

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
    <div className="bg-background pb-14 md:-ml-px md:w-[calc(100%+1px)]">
      <section className="relative min-h-[calc(100dvh-4rem)] overflow-hidden bg-[#03070d] text-white">
        <HeroBackgroundMedia mediaType={hero?.mediaType ?? 'VIDEO'} mediaUrl={heroMedia} fallbackImage={heroFallbackImage} autoplay={hero?.autoplay ?? true} />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(1,5,12,.96)_0%,rgba(1,5,12,.7)_43%,rgba(1,5,12,.18)_75%),linear-gradient(0deg,#03070d_0%,transparent_45%)]" />
        <div className="relative grid min-h-[calc(100dvh-4rem)] w-full overflow-hidden">
          <div className="relative z-10 flex flex-col justify-center p-7 sm:p-12 lg:p-16 xl:p-20">
            <div className="absolute -left-32 top-0 size-96 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.16em] backdrop-blur">
                <Sparkles className="size-3.5 text-amber-300" /> {hero?.eyebrow ?? 'Your personal shopping experience'}
              </span>
              <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[.92] tracking-[-.055em] sm:text-7xl xl:text-8xl">{hero?.title ?? 'Every beautiful moment starts here.'}</h1>
              <p className="mt-5 max-w-xl text-sm leading-6 text-white/70 sm:text-base">{hero?.summary ?? 'Build shopping lists like playlists, discover elegant experiences shaped around your taste, and move every pick from inspiration to delivery in one personal hub.'}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={hero?.primaryHref || '/sign-up'} className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-3.5 text-sm font-black text-[#07172b] transition hover:scale-[1.02]">{hero?.primaryLabel || 'Create your experience'} <ArrowRight className="size-4" /></Link>
                <Link href={hero?.secondaryHref || '/sign-in'} className="inline-flex items-center gap-2 rounded-md border border-white/25 bg-black/20 px-6 py-3.5 text-sm font-bold backdrop-blur transition hover:bg-white/10">{hero?.secondaryLabel || 'Sign in'}</Link>
              </div>
            </div>
          </div>

          <Link href={`/products/${featured.slug}`} className="hidden">
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

      <div className="relative z-10 -mt-12 rounded-t-[2.5rem] bg-background pt-2 shadow-[0_-30px_70px_rgba(0,0,0,.28)]">
        <ProductRail title="Most active experiences" subtitle="The products customers are exploring and choosing now" products={trending} onOpen={openProduct} onPreview={setPreviewProduct} onAdd={addProduct} />
      </div>

      <section className="mt-8 w-full px-4 sm:px-6">
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-3 scrollbar-none sm:mx-0 sm:px-0">
          {categories.slice(0, 6).map(category => (
            <Link key={category.id} href={`/store?category=${category.slug}`} className="group flex min-h-24 w-36 shrink-0 snap-start flex-col items-center justify-center rounded-2xl border border-border/55 bg-card px-3 py-4 text-center shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg sm:w-40 lg:w-44">
              <Image src={category.image} alt="" width={44} height={44} className="size-11 rounded-xl object-cover transition group-hover:scale-105" />
              <span className="mt-2 line-clamp-1 text-xs font-bold">{category.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 flex w-full snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 scrollbar-none sm:px-6">
        <PromoTile product={recommendations[0] ?? featured} eyebrow="Curated for you" title="Premium picks, without the noise" tone="dark" />
        <PromoTile product={newProducts[0] ?? trending[1] ?? featured} eyebrow="Fresh arrivals" title="Meet what’s new in the store" tone="light" />
      </section>

      {newProducts.length ? <ProductRail title="New and noteworthy" subtitle="Fresh additions worth discovering" products={newProducts} onOpen={openProduct} onPreview={setPreviewProduct} onAdd={addProduct} /> : null}
      <ProductRail title="Recommended for your next moment" subtitle="Highly rated selections across the store" products={recommendations} onOpen={openProduct} onPreview={setPreviewProduct} onAdd={addProduct} />

      <section className="mt-12 flex w-full snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 scrollbar-none sm:px-6">
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
    <section className="mt-12 w-full px-4 sm:px-6">
      <header className="mb-5 flex items-end justify-between gap-4">
        <div><h2 className="text-2xl font-black tracking-tight sm:text-3xl">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{subtitle}</p></div>
        <Link href="/store" className="hidden items-center gap-1 text-sm font-bold hover:underline sm:inline-flex">See all <ChevronRight className="size-4" /></Link>
      </header>
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-5 scrollbar-none sm:mx-0 sm:px-0">
        {products.slice(0, 8).map(product => <ProductCard key={product.id} product={product} onOpenExperience={onOpen} onPreview={onPreview} onAddToCart={onAdd} className="w-[48vw] max-w-[205px] shrink-0 snap-start sm:w-48 sm:max-w-none lg:w-52" />)}
      </div>
    </section>
  );
}

function PromoTile({ product, eyebrow, title, tone }: { product: ProductType; eyebrow: string; title: string; tone: 'dark' | 'light' }) {
  const variant = product.variants[0];
  if (!variant) return null;
  return (
    <Link href={`/products/${product.slug}`} className={`group relative block min-h-80 w-[88vw] max-w-2xl shrink-0 snap-start overflow-hidden rounded-[1.75rem] border border-border/50 lg:w-[44rem] ${tone === 'dark' ? 'bg-slate-950 text-white' : 'bg-stone-100 text-slate-950'}`}>
      <Image src={variant.image} alt="" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" />
      <div className={`absolute inset-0 ${tone === 'dark' ? 'bg-gradient-to-r from-black/90 via-black/55 to-transparent' : 'bg-gradient-to-r from-white/95 via-white/65 to-transparent'}`} />
      <div className="absolute inset-y-0 left-0 flex max-w-[70%] flex-col justify-center p-7 sm:p-10">
        <p className="text-xs font-black uppercase tracking-[.17em]">{eyebrow}</p><h3 className="mt-3 text-3xl font-black leading-tight">{title}</h3><span className="mt-6 inline-flex w-fit items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-xs font-black text-primary-foreground">Shop now <ArrowRight className="size-4" /></span>
      </div>
    </Link>
  );
}

function TrustCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <article className="flex w-[82vw] max-w-sm shrink-0 snap-start gap-4 rounded-2xl border border-border/55 bg-card p-5 sm:w-80"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">{icon}</span><div><h3 className="text-sm font-black">{title}</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p></div></article>;
}
