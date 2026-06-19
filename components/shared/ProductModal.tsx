'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';

import { ProductType } from '@/types';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { ChartColumnStacked, ChevronLeft, ChevronRight } from 'lucide-react';

import RatingComponent from './RatingComponent';
import LikedComponent from './LikedComponent';

type ProductModalProps = {
  product: ProductType | null;
  open: boolean;
  onClose: () => void;
  onToggleLike?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  currentIndex?: number;
  totalProducts?: number;
};

function ProductContent({
  product,
  onToggleLike,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  currentIndex,
  totalProducts
}: Omit<ProductModalProps, 'open' | 'onClose'> & {
  product: ProductType;
}) {
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id ?? '');

  const activeVariant =
    product.variants.find(variant => variant.id === selectedVariantId) ?? product.variants[0];

  return (
    <motion.div
      key={product.id}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.2 }}
      // FIXED: Added full height allocation and internal scrolling context here
      className="flex flex-col h-full overflow-y-auto scrollbar-none">
      {/* HERO IMAGE */}
      {/* FIXED: Changed aspect-16/10 to aspect-[16/10] */}
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-muted">
        <Image
          src={activeVariant.image}
          alt={product.name}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />

        <div className="relative z-30 flex flex-col" onClick={e => e.stopPropagation()}>
          <span className="absolute top-3 left-2">
            <LikedComponent productId={product.id} liked={product.liked} onToggle={onToggleLike} />
          </span>
          {product.discountPercentage > 0 && (
            <span className="top-6 absolute left-10 rounded-full border-b bg-rose-500/50 px-2 py-1 text-xs font-medium text-primary">
              -{product.discountPercentage}% off
            </span>
          )}
        </div>

        <div className="absolute inset-y-0 left-3 flex items-center">
          <button
            type="button"
            aria-label="Previous Product"
            onClick={onPrevious}
            disabled={!hasPrevious}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-black/70 disabled:opacity-30">
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        <div className="absolute inset-y-0 right-3 flex items-center">
          <button
            type="button"
            aria-label="Next Product"
            onClick={onNext}
            disabled={!hasNext}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-black/70 disabled:opacity-30">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur-md">
          {(currentIndex ?? 0) + 1} / {totalProducts}
        </div>
      </div>

      {/* CONTENT */}
      <div className="space-y-5 p-6 flex-1">
        <div>
          <h2 className="text-2xl font-semibold">{product.name}</h2>

          <span className="mt-1 flex items-center gap-1 text-xs text-primary">
            <ChartColumnStacked className="h-3 w-3 text-rose-500" />
            {product.category}
          </span>
        </div>

        <p className="text-sm text-muted-foreground">{product.shortDescription}</p>

        <RatingComponent rating={product.rating} reviews={product.reviews} />

        <div className="flex flex-col gap-4">
          <div className="text-2xl font-bold text-rose-500">₦{activeVariant.price.toLocaleString()}</div>

          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <span className="text-xs text-muted-foreground">Size</span>
              <span className="text-xs text-muted-foreground">{activeVariant.stockLeft} left</span>
            </div>

            <Select
              value={selectedVariantId}
              onValueChange={value => {
                setSelectedVariantId(value ?? '');
              }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Size" />
              </SelectTrigger>

              <SelectContent>
                {product.variants.map(variant => (
                  <SelectItem key={variant.id} value={variant.id}>
                    {variant.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-sm leading-relaxed text-muted-foreground">{product.longDescription}</div>

        <div className="flex flex-col gap-3 pt-4 sm:flex-row">
          <button
            type="button"
            className="flex-1 rounded-full bg-rose-500 px-5 py-3 font-medium text-white transition hover:bg-rose-600"
            onClick={() => {
              alert(`Added product: ${product.id} of size: ${activeVariant.label} to Cart`);
            }}>
            Add {activeVariant.label} to Cart
          </button>

          <button
            type="button"
            className="rounded-full border px-5 py-3 font-medium transition hover:bg-muted"
            onClick={() => {
              alert(`Saved product: ${product.id}`);
            }}>
            Save
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProductModal(props: ProductModalProps) {
  const { product, open, onClose } = props;

  if (!product) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={isOpen => {
        if (!isOpen) onClose();
      }}>
      <DialogContent
        className="
          max-w-4xl p-0 overflow-hidden
          w-[90vw] md:w-full
          h-full max-h-[80dvh] md:max-h-[70dvh]
          flex flex-col
        ">
        {/* FIXED: Replaced overflow-hidden with flex/h-full configurations */}
        <div className="w-full h-full min-h-0 flex flex-col">
          <AnimatePresence mode="wait">
            <ProductContent key={product.id} {...props} product={product} />
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
