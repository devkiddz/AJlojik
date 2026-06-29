'use client';

import { useMemo, useState } from 'react';
import { ProductType } from '@/types';
import { ArrowRight, Sparkles, ShieldCheck, Clock, ShoppingBag } from 'lucide-react';
import SingleProductGalleryView from './product/SingleProductGalleryView';
import ProductHeroSection from './product/ProductHeroSection';

type Props = {
  product: ProductType;
};

export default function ProductPageClientView({ product }: Props) {
  const [selectedVariantId, setSelectedVariantId] = useState<string>(product.variants[0]?.id ?? '');
  const [isLiked, setIsLiked] = useState<boolean>(product.liked);

  const activeVariant = useMemo(() => {
    return product.variants.find(v => v.id === selectedVariantId) ?? product.variants[0] ?? null;
  }, [product, selectedVariantId]);

  return (
    <div className="w-full">
      {/* HERO BANNER SECTION STAGE */}
      <ProductHeroSection
        product={product}
        activeVariant={activeVariant}
        isLiked={isLiked}
        setIsLiked={setIsLiked}
      />

      {/* TWO-COLUMN LOWER DATA MESH */}
      <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-8">
        {/* LEFT COLUMN: MAIN SPECIFICATION STAGE */}
        <div className="lg:col-span-8 space-y-6">
          {/* MEDIA GALLERY SECTION */}
          <section className="bg-card text-card-foreground border border-border p-4 sm:p-6 rounded-2xl shadow-xs overflow-hidden w-full">
            <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-4">
              Media Gallery
            </h3>
            <SingleProductGalleryView
              product={product}
              selectedVariantId={selectedVariantId}
              setSelectedVariantId={setSelectedVariantId}
            />
          </section>

          {/* DYNAMIC COMPREHENSIVE TEXT SPEC PANELS */}
          <section className="bg-card text-card-foreground border border-border p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold tracking-tight border-b border-border pb-3">Description</h3>
            <div className="text-xs sm:text-sm text-foreground/90 leading-relaxed space-y-4 font-medium">
              <p>{product.longDescription ?? product.shortDescription}</p>

              {/* TAG PIPES TRACK LIST */}
              <div className="flex flex-wrap gap-2 pt-2">
                {product.tags?.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-muted border border-border text-muted-foreground text-[11px] font-bold px-2.5 py-1 rounded-md">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* REVIEWS ASSESSMENT HUB */}
          <section className="bg-card text-card-foreground border border-border p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold">Ratings and reviews</h3>
              <div className="flex items-center gap-1 text-xs font-bold text-secondary hover:underline cursor-pointer">
                <span>See all {product.reviews} reviews</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-center bg-muted/50 p-4 rounded-xl border border-border">
              <div className="text-center sm:border-r border-border sm:pr-8 shrink-0">
                <h4 className="text-5xl font-black text-foreground tracking-tight">{product.rating}</h4>
                <p className="text-[10px] text-muted-foreground font-bold tracking-wide uppercase mt-1">
                  Global Ratings
                </p>
              </div>
              <div className="flex-1 w-full space-y-1.5 text-xs text-muted-foreground font-medium">
                <div className="flex items-center gap-2">
                  <span>5 ★</span>
                  <div className="h-2 flex-1 rounded-full bg-border overflow-hidden">
                    <div className="h-full w-[85%] bg-accent rounded-full" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span>4 ★</span>
                  <div className="h-2 flex-1 rounded-full bg-border overflow-hidden">
                    <div className="h-full w-[10%] bg-accent rounded-full" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span>3 ★</span>
                  <div className="h-2 flex-1 rounded-full bg-border overflow-hidden">
                    <div className="h-full w-[3%] bg-accent rounded-full" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span>2 ★</span>
                  <div className="h-2 flex-1 rounded-full bg-border overflow-hidden">
                    <div className="h-full w-[1%] bg-accent rounded-full" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span>1 ★</span>
                  <div className="h-2 flex-1 rounded-full bg-border overflow-hidden">
                    <div className="h-full w-[1%] bg-accent rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: TRANSACTION ASIDE PANEL */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          {/* TRANSACTION PROCESSING ENGINE */}
          <div className="bg-card text-card-foreground border border-border p-6 rounded-2xl space-y-5 shadow-xl">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase block mb-1">
                Price Configuration
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-foreground tracking-tight">
                  ₦{activeVariant?.price.toLocaleString() ?? '0'}
                </span>
                {product.discountPercentage > 0 && (
                  <span className="text-xs font-bold text-white bg-secondary px-1.5 py-0.5 rounded-sm">
                    -{product.discountPercentage}%
                  </span>
                )}
              </div>
            </div>

            {/* PIPELINE DISPATCH MATRIX */}
            <div className="space-y-3 text-xs border-y border-border py-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground font-semibold">
                  <Clock className="h-3.5 w-3.5 text-accent" /> Delivery Window:
                </span>
                <span className="font-bold text-foreground">{product.estimatedDelivery}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5 text-accent" /> Stock Availability:
                </span>
                <span
                  className={`font-bold ${activeVariant && activeVariant.stockLeft > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                  {activeVariant && activeVariant.stockLeft > 0
                    ? `${activeVariant.stockLeft} Items Left`
                    : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* ACTION TRIGGERS */}
            <div className="space-y-2.5">
              <button
                type="button"
                disabled={!activeVariant || activeVariant.stockLeft === 0}
                className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md hover:opacity-90 disabled:opacity-40 transition-all active:scale-[0.99]">
                <ShoppingBag className="h-4 w-4 stroke-[2.5]" />
                Add Item To Basket
              </button>
            </div>
          </div>

          {/* BRANDED PREMIUM GLOW BANNER */}
          <div className="premium-card p-5 rounded-2xl space-y-2 overflow-hidden">
            <h3 className="text-[10px] font-black tracking-wider text-accent uppercase flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Verified Authenticity Hub
            </h3>
            <p className="text-xs text-muted-foreground leading-normal font-medium">
              Every curated item features verifiable batch tracking origins and secure custom sealing locks.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
