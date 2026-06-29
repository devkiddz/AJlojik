'use client';

import Image from 'next/image';
import { Heart, Download, Share2, Star } from 'lucide-react';
import { ProductType, ProductVariant, categoryType } from '@/types';
import { categories } from '@/categories';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  product: ProductType;
  activeVariant: ProductVariant | null;
  isLiked: boolean;
  setIsLiked: (liked: boolean) => void;
};

export default function ProductHeroSection({ product, activeVariant, isLiked, setIsLiked }: Props) {
  const category = categories.find(item => item.slug === product.category) as categoryType | undefined;
  const displayImage = activeVariant?.image ?? product.variants[0]?.image ?? '/placeholder.jpg';
  const coverImage = category?.coverImages?.[0] ?? category?.image ?? '/placeholder.jpg';

  return (
    <section className="relative w-full overflow-hidden bg-background pt-16 md:pt-24 pb-10 border-b border-border">
      {/* 🎬 HIGH-FIDELITY UNBLURRED MICROSOFT STORE BACKDROP */}
      <div className="absolute inset-0 z-0 h-full w-full select-none pointer-events-none">
        <Image
          src={coverImage}
          alt=""
          fill
          priority
          className="object-cover object-center opacity-45 dark:opacity-65"
        />
        {/* Precise gradients transitioning smoothly into your --background token floor */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
      </div>

      {/* IDENTITY CONTAINER FRAME */}
      <div className="relative z-10 mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 md:gap-8">
          {/* THE NATIVE CONTAINER BLOCK */}
          <div className="relative h-32 w-32 sm:h-40 sm:w-40 shrink-0 overflow-hidden rounded-2xl border border-border bg-card p-1 shadow-2xl">
            <Image src={displayImage} alt={product.name} fill priority className="object-cover rounded-xl" />
          </div>

          {/* INTERFACE DETAILS MATRICES */}
          <div className="flex-1 space-y-4 max-w-2xl w-full">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
                {product.name}
              </h1>
              <p className="text-xs font-black text-secondary tracking-wider uppercase">
                {category?.label ?? 'Universal Retail Collection'}
              </p>
            </div>

            {/* RATINGS LINE */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-xs font-bold text-muted-foreground">
              <div className="flex items-center gap-1 text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                <Star className="h-3.5 w-3.5 fill-current text-accent" />
                <span className="text-foreground font-black">{product.rating}</span>
              </div>
              <span className="opacity-30">•</span>
              <span className="text-foreground/80">{product.reviews} Reviews</span>
              <span className="opacity-30">•</span>
              <span className="text-muted-foreground font-medium">{product.soldCount}+ Orders Filled</span>
            </div>

            {/* PRODUCT SUMMARY ABSTRACT */}
            <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed max-w-xl font-medium">
              {product.shortDescription}
            </p>

            {/* CTA TRIGGER ACTION CONTROLS */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <Button
                size="lg"
                className="h-11 px-8 rounded-xl text-xs font-black bg-secondary text-secondary-foreground hover:opacity-90 shadow-xl transition-all active:scale-[0.98]">
                <Download className="mr-2 h-4 w-4 stroke-[3]" />
                Direct Order
              </Button>

              <Button
                variant="secondary"
                size="icon"
                onClick={() => setIsLiked(!isLiked)}
                className={cn(
                  'h-11 w-11 rounded-xl bg-card border border-border text-foreground transition-all hover:bg-muted',
                  isLiked &&
                    'text-destructive bg-destructive/10 border-destructive/20 hover:bg-destructive/20'
                )}>
                <Heart className={cn('h-4 w-4', isLiked && 'fill-current')} />
              </Button>

              <Button
                variant="secondary"
                size="icon"
                className="h-11 w-11 rounded-xl bg-card border border-border text-foreground transition-all hover:bg-muted">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
