'use client';

import { Star, Truck, Package, ShieldCheck } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OverviewCard from '@/components/store/modules/OverviewCard';
import DetailsCard from '@/components/store/modules/DetailsCard';

import { ProductType } from '@/types/types';
import ReviewsCard from '@/components/store/modules/ReviewsCard';
import ShippingCard from '@/components/store/modules/ShippingCard';

type Props = {
  product: ProductType;
};

export default function ProductActions({ product }: Props) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      {/* MOBILE */}
      <div className="md:hidden">
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>

            <TabsTrigger value="details">Details</TabsTrigger>

            <TabsTrigger value="reviews">Reviews</TabsTrigger>

            <TabsTrigger value="shipping">Shipping</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewCard product={product} />
          </TabsContent>

          <TabsContent value="details">
            <DetailsCard product={product} />
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewsCard product={product} />
          </TabsContent>

          <TabsContent value="shipping">{/* <ShippingCard product={product} /> */}</TabsContent>
        </Tabs>
      </div>

      {/* DESKTOP */}
      <div className="hidden md:grid gap-6 lg:grid-cols-2">
        <OverviewCard product={product} />

        <DetailsCard product={product} />

        <ReviewsCard product={product} />

        {/* <ShippingCard product={product} /> */}
      </div>
    </section>
  );
}
