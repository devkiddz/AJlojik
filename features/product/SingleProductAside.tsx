'use client';

import { useMemo } from 'react'; // Removed useState for variantId, it's now a prop
import { ProductType } from '@/types';
import { Heart, ShoppingBag, Star, Tag, MessageCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VariantDropdown from './VariantDropdown';

interface Props {
  product: ProductType;
  selectedVariantId: string;
  setSelectedVariantId: (id: string) => void;
  isWishlisted: boolean;
  setIsWishlisted: (val: boolean) => void;
  isAdding: boolean;
  handleAddToCart: () => void;
  added: boolean;
}

export default function SingleProductAside({
  product,
  selectedVariantId,
  setSelectedVariantId,
  isWishlisted,
  setIsWishlisted,
  isAdding,
  handleAddToCart,
  added
}: Props) {
  const selectedVariant = useMemo(
    () => product.variants.find(v => v.id === selectedVariantId) ?? product.variants[0],
    [selectedVariantId, product.variants]
  );

  return (
    <aside className="sticky top-24 lg:col-span-4 h-fit">
      <div className="premium-card p-8 rounded-3xl border border-border shadow-xl space-y-8">
        {/* Header Stack */}
        <div className="space-y-4">
          <h1 className="text-2xl font-black tracking-tight">{product.name}</h1>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-accent">
              <Tag className="h-3 w-3" /> {product.category}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground">
              <Star className="h-3 w-3 fill-accent text-accent" /> {product.rating}
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <MessageCircle className="h-3 w-3 ml-1" /> {product.reviews}
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">{product.shortDescription}</p>

        {/* Price now tracks the selectedVariant prop */}
        <p className="text-3xl font-black text-foreground">₦{selectedVariant?.price.toLocaleString()}</p>

        <VariantDropdown
          variants={product.variants}
          selectedId={selectedVariantId}
          onSelect={setSelectedVariantId}
        />

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <Button
            onClick={handleAddToCart}
            disabled={isAdding || added}
            className="col-span-2 h-12 bg-background text-primary-foreground font-black text-xs uppercase tracking-widest rounded-xl hover:opacity-90 transition-all">
            {added ? (
              <>
                <Check className="mr-2 h-4 w-4" /> Added!
              </>
            ) : isAdding ? (
              'Processing...'
            ) : (
              <>
                <ShoppingBag className="mr-2 h-4 w-4" /> Buy Now
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => setIsWishlisted(!isWishlisted)}
            className={`h-12 w-full rounded-xl border-border transition-all ${isWishlisted ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'hover:bg-muted'}`}>
            <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
          </Button>
        </div>

        <p className="text-[10px] text-center text-muted-foreground font-medium pt-4 border-t border-border">
          Estimated delivery: {product.estimatedDelivery}
        </p>
      </div>
    </aside>
  );
}
