import Image from 'next/image';

import { Heart, ShoppingBag } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { CommerceProduct } from '../../contracts/customerDashboardTypes';

type JourneyProductCollageProps = {
  products: CommerceProduct[];
  title: string;
  className?: string;

  /**
   * Repeats available products as a visual fallback until
   * all four collage positions are occupied.
   */
  fillToFour?: boolean;
};

export function JourneyProductCollage({
  products,
  title,
  className,
  fillToFour = false
}: JourneyProductCollageProps) {
  const visibleProducts = resolveVisibleProducts(products, fillToFour);

  if (visibleProducts.length === 0) {
    return <EmptyCollage title={title} className={className} />;
  }

  return (
    <div
      aria-label={`${title} product preview`}
      className={cn('relative overflow-hidden rounded-xl bg-muted', className)}>
      {visibleProducts.length === 1 ? <SingleProduct product={visibleProducts[0]} /> : null}

      {visibleProducts.length === 2 ? <TwoProductCollage products={visibleProducts} /> : null}

      {visibleProducts.length === 3 ? <ThreeProductCollage products={visibleProducts} /> : null}

      {visibleProducts.length >= 4 ? <FourProductCollage products={visibleProducts} /> : null}

      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5" />
    </div>
  );
}

function resolveVisibleProducts(products: CommerceProduct[], fillToFour: boolean): CommerceProduct[] {
  const availableProducts = products.filter(product => Boolean(product.image)).slice(0, 4);

  if (!fillToFour || availableProducts.length === 0 || availableProducts.length >= 4) {
    return availableProducts;
  }

  const resolvedProducts = [...availableProducts];

  let productIndex = 0;

  while (resolvedProducts.length < 4) {
    resolvedProducts.push(availableProducts[productIndex % availableProducts.length]);

    productIndex += 1;
  }

  return resolvedProducts;
}

function SingleProduct({ product }: { product: CommerceProduct }) {
  return <ProductImage product={product} sizes="320px" className="size-full" />;
}

function TwoProductCollage({ products }: { products: CommerceProduct[] }) {
  return (
    <div className="grid size-full grid-cols-2 gap-px bg-border/40">
      {products.map((product, index) => (
        <ProductImage key={`${product.id}-${index}`} product={product} sizes="160px" className="size-full" />
      ))}
    </div>
  );
}

function ThreeProductCollage({ products }: { products: CommerceProduct[] }) {
  return (
    <div className="grid size-full grid-cols-2 gap-px bg-border/40">
      <ProductImage product={products[0]} sizes="220px" className="row-span-2 size-full" />

      <ProductImage product={products[1]} sizes="120px" className="size-full" />

      <ProductImage product={products[2]} sizes="120px" className="size-full" />
    </div>
  );
}

function FourProductCollage({ products }: { products: CommerceProduct[] }) {
  return (
    <div className="grid size-full grid-cols-2 grid-rows-2 gap-px bg-border/40">
      {products.slice(0, 4).map((product, index) => (
        <ProductImage key={`${product.id}-${index}`} product={product} sizes="160px" className="size-full" />
      ))}
    </div>
  );
}

function ProductImage({
  product,
  sizes,
  className
}: {
  product: CommerceProduct;
  sizes: string;
  className?: string;
}) {
  return (
    <div className={cn('relative min-h-0 min-w-0 overflow-hidden bg-muted', className)}>
      {product.image ? (
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes={sizes}
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="grid size-full place-items-center">
          <ShoppingBag className="size-5 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

function EmptyCollage({ title, className }: { title: string; className?: string }) {
  return (
    <div
      className={cn(
        'grid place-items-center rounded-xl border border-dashed border-border/70 bg-muted/20',
        className
      )}>
      <span className="text-center">
        <span className="mx-auto grid size-10 place-items-center rounded-xl bg-background shadow-sm">
          <Heart className="size-4 text-muted-foreground" />
        </span>

        <span className="mt-3 block text-xs font-medium text-muted-foreground">
          No {title.toLowerCase()} yet
        </span>
      </span>
    </div>
  );
}
