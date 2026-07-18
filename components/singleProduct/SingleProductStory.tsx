import { ProductType } from '@/types/types';

type Props = {
  product: ProductType;
};

export default function SingleProductStory({ product }: Props) {
  return (
    <section className="rounded-3xl border bg-card p-8">
      <h2 className="mb-6 text-2xl font-bold">{"Why You’ll Love It"}</h2>

      <p className="leading-8 text-muted-foreground">
        {product.name} is selected for its premium quality and designed to create memorable experiences.
        It remains one of our customers’ favourite choices.
      </p>
    </section>
  );
}
