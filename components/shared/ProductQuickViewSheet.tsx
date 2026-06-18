'use client';

import Image from 'next/image';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

import { ProductType } from '@/types';

type Props = {
  product: ProductType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ProductQuickViewSheet({ product, open, onOpenChange }: Props) {
  if (!product) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader>
          <SheetTitle>{product.name}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div className="relative h-64 rounded-xl overflow-hidden">
            <Image src={product.images} alt={product.name} fill className="object-cover" />
          </div>

          <p className="text-muted-foreground">{product.shortDescription}</p>

          <div className="font-bold text-xl">₦{product.price}</div>

          <button className="w-full rounded-lg bg-rose-500 py-3 text-white">Add To Cart</button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
