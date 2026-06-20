// app/products/[id]/page.tsx
import React from 'react';
import ProductPageClientView from '@/components/store/ProductPageClientView';

type Props = {
  params: { id: string };
};

export default function ProductPage({ params }: Props) {
  return <ProductPageClientView productId={params.id} />;
}
