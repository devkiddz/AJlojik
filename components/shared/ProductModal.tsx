'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ProductType } from '@/types';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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

export default function ProductModal({
  product,
  open,
  onClose,
  onToggleLike,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  currentIndex,
  totalProducts
}: ProductModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={isOpen => {
        if (!isOpen) onClose();
      }}>
      <DialogContent className="max-w-4xl overflow-hidden overflow-y-scroll scroll-smooth scrollbar-thumb-sidebar-border scrollbar-none p-0">
        {!product ? null : (
          <AnimatePresence mode="wait">
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}>
              {/* HERO IMAGE */}
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                <Image src={product.images} alt={product.name} fill className="object-cover" />

                <LikedComponent productId={product.id} liked={product.liked} onToggle={onToggleLike} />

                {/* PREVIOUS */}
                <div className="absolute inset-y-0 left-3 flex items-center">
                  <button
                    type="button"
                    aria-label="Previous product"
                    onClick={onPrevious}
                    disabled={!hasPrevious}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:scale-105 hover:bg-black/70 active:scale-95 disabled:opacity-30">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                </div>

                {/* NEXT */}
                <div className="absolute inset-y-0 right-3 flex items-center">
                  <button
                    type="button"
                    aria-label="Next product"
                    onClick={onNext}
                    disabled={!hasNext}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:scale-105 hover:bg-black/70 active:scale-95 disabled:opacity-30">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>

                {/* COUNTER */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur-md">
                  {(currentIndex ?? 0) + 1} / {totalProducts}
                </div>
              </div>

              {/* CONTENT */}
              <div className="space-y-5 p-6">
                <div>
                  <h2 className="text-2xl font-semibold">{product.name}</h2>

                  <span className="mt-1 flex items-center gap-1 text-xs text-primary">
                    <ChartColumnStacked className="h-3 w-3 text-rose-500" />
                    {product.category}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground">{product.shortDescription}</p>

                <RatingComponent rating={product.rating} reviews={product.reviews} />

                <div className="text-2xl font-bold text-rose-500">₦{product.price}</div>

                <div className="text-sm leading-relaxed text-muted-foreground">
                  {product.longDescription ?? 'No additional description available.'}
                </div>

                {/* ACTIONS */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    aria-label="Add to cart"
                    className="flex-1 rounded-full bg-rose-500 px-5 py-3 font-medium text-white transition hover:bg-rose-600">
                    Add to Cart
                  </button>

                  <button
                    type="button"
                    aria-label="Save product"
                    className="rounded-full border px-5 py-3 font-medium transition hover:bg-muted">
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </DialogContent>
    </Dialog>
  );
}
