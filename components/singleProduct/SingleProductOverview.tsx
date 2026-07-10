'use client';

import { ProductType } from '@/types';
import { ChartColumnStacked, Heart, ShoppingBag } from 'lucide-react';
import RatingComponent from '../shared/RatingComponent';

type Props = {
  product: ProductType;
  selectedVariantId: string;
  setSelectedVariantId: (id: string) => void;
};

export default function SingleProductOverview({ product, selectedVariantId, setSelectedVariantId }: Props) {
  const selectedProduct = product.variants.find(v => v.id === selectedVariantId) ?? product.variants[0];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG').format(price);
  };

  // Example handler functions - connect these to your actual state management/context
  const handleBuyNow = (variantId: string) => {
    console.log('Buying variant:', variantId);
    // e.g., router.push(`/checkout?variant=${variantId}`)
  };

  const handleToggleWishlist = (variantId: string) => {
    console.log('Adding to wishlist:', variantId);
    // e.g., addToWishlist(variantId)
  };

  return (
    <section className="flex flex-col gap-4 md:gap-8 rounded-3xl border bg-card p-4 pt-8 md:p-8 md:flex-row">
      <div className="flex flex-1 flex-col justify-center">
        {/* Description Header */}
        <div className="space-y-4 md:space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{product.name}</h2>
            <div className="flex items-center gap-1 text-sm text-primary md:text-md">
              <ChartColumnStacked className="h-3 w-3 text-rose-500 md:h-4 md:w-4" />
              {product.category}
            </div>
            <div className="flex items-center space-x-8 gap-3 md:gap-6 text-sm text-primary md:text-md">
              <RatingComponent rating={product.rating} reviews={product.reviews} />
            </div>
            <p className="text-muted-foreground">{product.longDescription}</p>
          </div>

          <div className="flex items-start gap-2">
            <span className="font-semibold">NGN</span>
            <p className="text-foreground text-2xl md:text-4xl font-bold">
              {formatPrice(selectedProduct.price)}
            </p>
          </div>
        </div>

        {/* Action Buttons: Now connected to selectedProduct.id */}
        <div className="flex gap-4 mt-6 max-w-sm">
          <button
            onClick={() => handleBuyNow(String(selectedProduct.id))}
            className="flex-1 flex items-center justify-center gap-2 bg-background text-primary-foreground rounded-full font-semibold hover:opacity-90 transition-opacity">
            <ShoppingBag className="w-5 h-5" />
            Buy Now
          </button>
          <button
            onClick={() => handleToggleWishlist(String(selectedProduct.id))}
            className="flex items-center justify-center gap-2 border border-secondary hover:bg-secondary/80 text-secondary hover:text-primary-foreground py-3 px-6 rounded-full font-semibold transition-colors">
            <Heart className="w-5 h-5" />
            Wishlist
          </button>
        </div>

        {/* Variant Selection Chips */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex flex-col">
              <div className="text-sm font-bold text-primary flex gap-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Selected Variant:
                </h3>
                {selectedProduct.label}
              </div>
              <div className="text-sm font-bold text-accent bg-accent/30 p-3 flex flex-1 items-center justify-center rounded-full mt-2">
                ({selectedProduct.stockLeft} {selectedProduct.label} variants left)
              </div>
            </div>
          </div>

          <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
            {product.variants.map(variant => {
              const isSelected = variant.id === selectedVariantId;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setSelectedVariantId(String(variant.id))}
                  className={`whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-medium transition-colors border ${
                    isSelected
                      ? 'bg-background text-primary-foreground border-primary'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border'
                  }`}>
                  {variant.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
