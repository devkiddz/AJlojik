'use client';

import { ProductType } from '@/types';
import Image from 'next/image';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import RatingComponent from './RatingComponent';
import { ChartColumnStacked } from 'lucide-react';
import LikedComponent from './LikedComponent';

type ProductModalProps = {
  product: ProductType | null;
  open: boolean;
  onClose: () => void;
  onToggleLike?: () => void;
};

export default function ProductModal({ product, open, onClose, onToggleLike }: ProductModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={isOpen => {
        if (!isOpen) onClose();
      }}>
      <DialogContent className="max-w-3xl overflow-hidden p-0">
        {!product ? null : (
          <div>
            <div className="relative aspect-video overflow-hidden bg-muted">
              <Image src={product.images} alt={product.name} fill className="object-cover" />

              <LikedComponent productId={product.id} liked={product.liked} onToggle={onToggleLike} />
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-2xl font-semibold">{product.name}</h2>

                <span className="text-xs text-primary flex items-center gap-1 mt-1">
                  <ChartColumnStacked className="w-3 h-3 text-rose-500" />
                  {product.category}
                </span>
              </div>

              <p className="text-sm text-muted-foreground">{product.shortDescription}</p>

              <RatingComponent rating={product.rating} reviews={product.reviews} />

              <div className="text-2xl font-bold text-rose-500">₦{product.price}</div>

              <div className="text-sm text-muted-foreground leading-relaxed">
                {product.longDescription ?? 'No additional description available.'}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  aria-label="Add to Cart"
                  className="flex-1 rounded-full px-4 py-2 bg-primary text-primary-foreground">
                  Add to Cart
                </button>

                <button type="button" aria-label="save product" className="rounded-full border px-4 py-2">
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
