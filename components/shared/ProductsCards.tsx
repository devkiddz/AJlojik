'use client';

import { ProductsType } from '@/types';
import { motion } from 'framer-motion';
import Image from 'next/image';
import RatingComponent from './RatingComponent';
import { Button } from '../ui/button';
import { ChartColumnStacked, Wine } from 'lucide-react';
import LikedComponent from './LikedComponent';

type ProductCardProps = {
  products: ProductsType;
};

// const products = [
//   {
//     name: 'Red Wine',
//     price: '$12',
//     tag: 'Vine',
//     description: 'You may add neccessary descriptions, but keep it little. A bottle of fine red wine.'
//   },
//   { name: 'BBQ Chicken', price: '$8', tag: 'Kitchen', description: 'Juicy grilled chicken with BBQ sauce.' },
//   { name: 'Whiskey', price: '$25', tag: 'Liqz', description: 'Premium whiskey with a smooth finish.' },
//   { name: 'Spices Pack', price: '$5', tag: 'Kitchen', description: 'A collection of premium spices.' },
//   { name: 'Champagne', price: '$18', tag: 'Liqz', description: 'Effervescent champagne for celebrations.' },
//   { name: 'Brandy', price: '$28', tag: 'Liqz', description: 'Rich and complex brandy with a hint of oak.' }
// ];

export default function ProductCard({ products }: ProductCardProps) {
  return (
    <>
      {products.map((item, i) => (
        <motion.div
          key={i}
          whileHover={{ scale: 1.05, y: -4 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="rounded-xl border bg-background p-4 shadow-sm">
          <div className="relative h-60 bg-muted rounded-lg mb-3">
            <Image src={item.images} alt={item.name} fill className="object-cover object-bottom rounded-lg" />
            <LikedComponent productId={item.id} liked={item.liked} />
          </div>
          <div>
            <h3 className="font-semibold rounded-full inset pt-2 text-sm md:text-md">{item.name}</h3>
            <span className="text-primary flex items-center gap-1 pb-2 text-xs">
              <ChartColumnStacked className="w-3 h-3 text-rose-500 rounded-full" />
              {item.category}
            </span>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.shortDescription}</p>
          </div>
          <div>
            <RatingComponent rating={item.rating} reviews={item.reviews} />
          </div>
          <div className="flex items-center justify-between gap-0.5 text-sm md:text-md mt-2 font-bold text-rose-500 pb-2">
            <div>
              <span className="">₦</span>
              {item.price}
            </div>

            <div>
              <Button size="sm" variant="outline" className="hover:bg-background transition-all">
                <Wine />
                Add Item
              </Button>
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );
}
