// components/promos/PromoSection.tsx

import { Promo } from '@/data/promos';
import { ProductType } from '@/types';

import PromoCard from './PromoCard';
import { ArrowRight } from 'lucide';
import { ArrowRightCircle } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

type Props = {
  promos: Promo[];
  products: ProductType[];
  onSelect?: (id: string) => void;
};

export default function PromoSection({ promos, products, onSelect }: Props) {
  const activePromos = promos.filter(promo => promo.active).sort((a, b) => a.priority - b.priority);

  if (activePromos.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="w-1/2 md:w-full">
          <h2 className="text-lg font-bold tracking-tight md:text-2xl">Promos & Deals</h2>

          <p className="text-sm text-muted-foreground">
            Discounts, hot picks, sales and best-selling products.
          </p>
        </div>

        <div>
          <Link href="/promos">
            <Button variant="outline" className="gap-2 rounded-full cursor-pointer">
              All
              <ArrowRightCircle className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {activePromos.map(promo => {
          const promoProducts = products.filter(product => promo.productIds.includes(product.id));

          return <PromoCard key={promo.id} promo={promo} products={promoProducts} onSelect={onSelect} />;
        })}
      </div>
    </section>
  );
}
