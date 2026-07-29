import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { StoreProductDetailExperience } from '@/features/products/components/StoreProductDetailExperience';
import { getStoreProductDetail } from '@/features/products/server';

type StoreProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params
}: StoreProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const detail = await getStoreProductDetail(id);

  if (!detail) {
    return {
      title: 'Product | AJ Logik'
    };
  }

  return {
    title: `${detail.product.name} | AJ Logik`,
    description:
      detail.product.shortDescription ||
      `Shop ${detail.product.name} on AJ Logik.`
  };
}

export default async function StoreProductPage({
  params
}: StoreProductPageProps) {
  const { id } = await params;
  const detail = await getStoreProductDetail(id);

  if (!detail) {
    notFound();
  }

  const resolvedDetail = detail as NonNullable<typeof detail>;

  return (
    <StoreProductDetailExperience
      product={resolvedDetail.product}
      gallery={resolvedDetail.gallery}
      relatedProducts={resolvedDetail.relatedProducts}
    />
  );
}
