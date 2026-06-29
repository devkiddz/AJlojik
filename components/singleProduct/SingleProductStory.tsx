import { ProductType } from '@/types';

type Props = {
  product: ProductType;
};

export default function SingleProductStory({ product }: Props) {
  return (
    <section className="rounded-3xl border bg-card p-8">
      <h2 className="mb-6 text-2xl font-bold">Why You'll Love It</h2>

      <p className="leading-8 text-muted-foreground">
        Crafted with premium quality and designed for memorable experiences, this product is one of our
        customers' favourites.
      </p>
    </section>
  );
}
