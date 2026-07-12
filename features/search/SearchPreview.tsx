'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ArrowUpRight, ShoppingCart, Tag, Sparkles, ChevronDown, Check, Heart } from 'lucide-react';
import { ProductType, ProductVariantType } from '@/types/types';
import { categories } from '@/data/categories';
import { useSearch } from '@/providers/SearchProvider';
import LikedComponent from '@/components/shared/LikedComponent';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  product?: ProductType;
};

export default function SearchPreview({ product }: Props) {
  const { selectProduct } = useSearch();

  // Global action hooks (Connect your active state dispatchers here)
  const addToCartAction = (p: ProductType, v: any) => console.log('Cart Added:', p.id, v.id);

  const toggleLikeAction = (id: string) => {
    console.log('Wishlist Mutation Fired For:', id);
  };

  const [selectedVariantId, setSelectedVariantId] = useState<ProductVariantType['id'] | ''>('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Keep state matching whenever user changes items in main list
  useEffect(() => {
    if (product) {
      setSelectedVariantId(product.variants?.[0]?.id ?? '');
      setIsLiked(!!product.liked);
    }
    setIsOpen(false);
  }, [product]);

  // Handle closing options dropdown when clicking away
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  if (!product) {
    return (
      <div className="flex h-full min-h-[450px] flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/5 text-muted-foreground/60 p-6 text-center">
        <Sparkles className="mb-2 h-5 w-5 opacity-40 animate-pulse" />
        <p className="text-xs font-medium tracking-wide">Select an item to preview</p>
      </div>
    );
  }

  const activeVariant = product.variants.find(v => v.id === selectedVariantId) ?? product.variants[0];
  const categoryLabel = categories.find(c => c.slug === product.category)?.label ?? product.category;

  // Single truth action function for execution mutations
  const handleLikeToggle = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsLiked(prev => !prev);
    toggleLikeAction(product.id);
  };

  return (
    /* 🚀 FIXED: Dropped 'h-full' restriction constraint to allow natural parent viewport scrolling down the container axis */
    <aside
      onClick={() => selectProduct(product)}
      className="group flex flex-col mx-auto max-w-[360px] w-full rounded-2xl border bg-background p-4 shadow-md hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer">
      {/* CARD IMAGE STAGE */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted/40 border">
        <Image
          src={activeVariant.image}
          alt={product.name}
          fill
          priority
          sizes="(max-width: 1024px) 40vw, 25vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* TOP LEFT FLOATING LIKE LAYER */}
        <div
          className="absolute left-2 top-2 z-10 scale-90 hover:scale-100 transition-all active:scale-90"
          onClick={handleLikeToggle}>
          <LikedComponent productId={product.id} liked={isLiked} onToggle={() => handleLikeToggle()} />
        </div>
      </div>

      {/* METADATA BRIEF */}
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary bg-background/5 px-2 py-0.5 rounded-full">
          <Tag className="h-2.5 w-2.5" />
          {categoryLabel}
        </span>
        <span className="text-[11px] text-muted-foreground">In Stock: {activeVariant.stockLeft}</span>
      </div>

      {/* TYPOGRAPHY TITLE */}
      <div className="mt-2.5">
        <h2 className="text-lg font-bold tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {product.name}
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mt-1">
          {product.shortDescription}
        </p>
      </div>

      {/* PURCHASE ROW CONTROLS */}
      <div className="mt-6 pt-2 space-y-3" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xl font-black text-foreground">₦{activeVariant.price.toLocaleString()}</span>

          {/* PREMIUM FULLY STYLED CUSTOM INLINE DROPDOWN */}
          {product.variants.length > 1 && (
            <div ref={dropdownRef} className="relative shrink-0 z-50">
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="
                  flex 
                  h-8.5 
                  w-[115px] 
                  items-center 
                  justify-between 
                  rounded-xl 
                  border 
                  border-input/60 
                  bg-muted/40 
                  hover:bg-muted/70
                  px-3 
                  text-xs 
                  font-semibold 
                  tracking-tight
                  text-foreground
                  shadow-xs 
                  outline-none 
                  transition-all
                  focus:border-primary/40 
                  focus:ring-2 
                  focus:ring-primary/10
                ">
                <span className="truncate">{activeVariant.label}</span>
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 text-muted-foreground/70 transition-transform duration-200',
                    isOpen && 'rotate-180'
                  )}
                />
              </button>

              {/* FLOATING LIST OPTIONS PANEL */}
              {isOpen && (
                <div className="absolute right-0 bottom-full mb-1.5 w-[140px] rounded-xl border bg-background p-1 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <div className="max-h-[140px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 pr-0.5 space-y-0.5">
                    {product.variants.map(v => {
                      const isSelected = v.id === activeVariant.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => {
                            setSelectedVariantId(v.id);
                            setIsOpen(false);
                          }}
                          className={cn(
                            'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors select-none',
                            isSelected
                              ? 'bg-background text-primary-foreground font-semibold'
                              : 'text-foreground hover:bg-muted/80'
                          )}>
                          <span className="truncate">{v.label}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PRIMARY FOOTER CTA ACTION LAYOUT */}
        <div className="flex gap-2">
          <Button
            onClick={() => selectProduct(product)}
            className="flex-1 h-10 gap-1.5 rounded-xl text-xs font-semibold bg-background text-primary-foreground shadow-sm transition-all active:scale-[0.98]">
            View Product
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Button>

          {/* DEDICATED ACTION ICON ROW FOR WISHLIST & CART */}
          <div className="flex gap-1.5 shrink-0">
            <Button
              variant="outline"
              size="icon"
              onClick={handleLikeToggle}
              className={cn(
                'h-10 w-10 rounded-xl border-muted transition-all duration-200 active:scale-95',
                isLiked
                  ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100/70 hover:text-rose-600'
                  : 'hover:bg-accent/10 text-muted-foreground'
              )}
              aria-label="Add variant to wishlist">
              <Heart
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  isLiked && 'fill-current scale-105'
                )}
              />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => addToCartAction(product, activeVariant)}
              className="h-10 w-10 rounded-xl border-muted text-foreground shadow-sm hover:bg-accent/10 active:scale-95 transition-transform"
              aria-label="Add variant to cart">
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
