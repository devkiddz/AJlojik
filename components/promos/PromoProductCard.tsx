import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Flame, Package, Tag, Timer, TrendingUp } from 'lucide-react';

import { Promo } from '@/data/promos';
import { ProductType } from '@/types/types';
import { Button } from '@/components/ui/button';
import PromoCountdown from './PromoCountdown';

type Props = {
  promo: Promo;
  product: ProductType;
};

export default function PromoProductCard({ promo, product }: Props) {
  const variant = product.variants[0];

  return (
    <article className="group overflow-hidden rounded-2xl border bg-card transition hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/promos/${promo.slug}/products/${product.slug}`}>
        <div className="relative h-56 overflow-hidden bg-muted">
          <Image
            src={variant.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />

          <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
            {promo.badge}
          </span>

          {promo.discountPercent ? (
            <span className="absolute right-3 top-3 rounded-full bg-destructive px-3 py-1 text-xs font-bold text-white">
              {promo.discountPercent}% OFF
            </span>
          ) : null}

          <div className="absolute bottom-3 left-3 overflow-hidden rounded-3xl border border-white/20 bg-white/5 p-2 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-2xl">
            <PromoCountdown startsAt={promo.startsAt} endsAt={promo.endsAt} compact />
          </div>
        </div>
      </Link>

      <div className="space-y-3 p-4">
        <div>
          <h4 className="line-clamp-1 text-base font-bold">{product.name}</h4>

          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{product.shortDescription}</p>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-lg font-black text-secondary">₦{variant.price.toLocaleString()}</p>

            <p className="text-xs text-muted-foreground">{variant.label}</p>
          </div>

          <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary">
            {product.category}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl bg-muted p-3">
            <div className="mb-1 flex items-center gap-1 font-bold">
              <Package className="h-3 w-3" />
              {variant.stockLeft}
            </div>
            <p className="text-muted-foreground">Stock left</p>
          </div>

          <div className="rounded-xl bg-muted p-3">
            <div className="mb-1 flex items-center gap-1 font-bold capitalize">
              <TrendingUp className="h-3 w-3" />
              {promo.type}
            </div>
            <p className="text-muted-foreground">Promo type</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {product.featured ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-background/10 px-3 py-1 text-xs font-bold text-primary">
              <Flame className="h-3 w-3" />
              Featured
            </span>
          ) : null}

          {product.isNew ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
              New
            </span>
          ) : null}

          {product.soldCount ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-bold">
              <Tag className="h-3 w-3" />
              {product.soldCount} sold
            </span>
          ) : null}
        </div>

        <Link href={`/promos/${promo.slug}/products/${product.slug}`}>
          <Button className="w-full gap-2 rounded-full">
            View Promo Product
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </article>
  );
}
