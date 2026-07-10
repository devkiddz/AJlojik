import { Star } from 'lucide-react';
import { ProductType } from '@/types';

export default function ProductInfo({ product }: { product: ProductType }) {
  return (
    <div className="space-y-4">
      {/* Badges */}
      <div className="flex gap-2">
        {product.featured && (
          <span className="px-3 py-1 text-xs rounded-full bg-green-500/20 text-green-400">Bestseller</span>
        )}
        {product.discountPercentage && (
          <span className="px-3 py-1 text-xs rounded-full bg-red-500/20 text-red-400">
            -{product.discountPercentage}%
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="text-2xl font-semibold">{product.name}</h1>

      {/* Rating */}
      <div className="flex items-center gap-2 text-sm text-white/70">
        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        <span>{product.rating}</span>
        <span>({product.reviews} reviews)</span>
      </div>

      {/* Meta */}
      <div className="space-y-1 text-sm text-white/60">
        <p>Brand: {product.slug}</p>
        <p>Category: {product.category}</p>
        <p className="text-green-400">In Stock</p>
      </div>

      {/* Description */}
      <p className="text-white/70 leading-relaxed">{product.shortDescription}</p>
    </div>
  );
}
