'use client';

// Changed type import name to reflect a single product item type (e.g., ProductType)
import { ProductType } from '@/types';
import { motion } from 'framer-motion';
import Image from 'next/image';
import RatingComponent from './RatingComponent';
import { Button } from '../ui/button';
import { ChartColumnStacked, Wine } from 'lucide-react';
import LikedComponent from './LikedComponent';
import Link from 'next/link';

// Update prop definitions to accept a singular product object
type ProductCardProps = {
  product: ProductType;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="rounded-xl border bg-background p-4 shadow-sm">
      <Link href={`/products/${product.id}`} aria-label={product.name}>
        <div className="relative aspect-4/3 bg-muted rounded-lg mb-3 overflow-hidden">
          {/* Note: if product.images is an array, use product.images[0] */}
          <Image
            src={product.images}
            alt={product.name}
            fill
            className="object-cover object-bottom rounded-lg"
          />
          <LikedComponent productId={product.id} liked={product.liked} />
        </div>

        <div className="p-3">
          <h3 className="font-semibold pt-2 text-sm md:text-md line-clamp-1">{product.name}</h3>
          <span className="text-primary flex items-center gap-1 pb-2 text-xs">
            <ChartColumnStacked className="w-3 h-3 text-rose-500 rounded-full" />
            {product.category}
          </span>
        </div>

        <div className="product-details rounded-2xl border border-muted bg-gradient-to-b from-background/80 to-background/30 backdrop-blur-md shadow-sm overflow-hidden group hover:border-muted-foreground/20 transition-all duration-300 p-3">
          <div className="product-descript">
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.shortDescription}</p>
          </div>
          <div>
            <RatingComponent rating={product.rating} reviews={product.reviews} />
          </div>

          <div className="flex items-center justify-between gap-0.5 text-sm md:text-md mt-2 font-bold text-rose-500 pb-2">
            <div>
              <span>₦</span>
              {product.price}
            </div>

            <div>
              <Button size="sm" variant="outline" className="hover:bg-background transition-all">
                <Wine className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
