import { cn } from '@/lib/utils';

import type { ProductType } from '@/types/types';

type ProductBadge = {
  id: string;
  label: string;

  tone: 'discount' | 'hot' | 'featured' | 'new';
};

type ProductStatusBadgesProps = {
  product: ProductType;
  className?: string;
};

function resolveProductBadges(product: ProductType): ProductBadge[] {
  const badges: ProductBadge[] = [];

  const normalizedTags = product.tags.map(tag => tag.trim().toLowerCase());

  const isHot = normalizedTags.some(tag => tag.includes('hot'));

  if (product.discountPercentage > 0) {
    badges.push({
      id: 'discount',
      label: `-${product.discountPercentage}%`,
      tone: 'discount'
    });
  }

  if (isHot) {
    badges.push({
      id: 'hot',
      label: 'Hot',
      tone: 'hot'
    });
  }

  if (product.isNew) {
    badges.push({
      id: 'new',
      label: 'New',
      tone: 'new'
    });
  }

  if (product.featured) {
    badges.push({
      id: 'featured',
      label: 'Featured',
      tone: 'featured'
    });
  }

  return badges.slice(0, 2);
}

const badgeStyles = {
  discount: 'bg-rose-600 text-white',

  hot: 'bg-orange-500 text-white',

  featured: 'bg-primary text-primary-foreground',

  new: 'bg-violet-600 text-white'
} satisfies Record<ProductBadge['tone'], string>;

export function ProductStatusBadges({ product, className }: ProductStatusBadgesProps) {
  const badges = resolveProductBadges(product);

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className={cn('pointer-events-none absolute left-3 top-3 z-30 flex flex-wrap gap-1.5', className)}>
      {badges.map(badge => (
        <span
          key={badge.id}
          className={cn(
            'rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide shadow-sm',
            badgeStyles[badge.tone]
          )}>
          {badge.label}
        </span>
      ))}
    </div>
  );
}
