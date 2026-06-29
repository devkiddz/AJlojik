import { notFound } from 'next/navigation';
import { SingleProductLayout } from '@/components/singleProduct';

import { products } from '@/data/products';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductPage({ params }: Props) {
  const { id } = await params;

  const product = products.find(p => p.id.trim() === id.trim() || p.slug.trim() === id.trim());

  if (!product) {
    notFound();
  }

  return <SingleProductLayout product={product} />;
}
