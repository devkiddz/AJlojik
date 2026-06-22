import ProductPageClientView from '@/components/store/ProductPageClientView';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductPage({ params }: Props) {
  const { id } = await params;

  return <ProductPageClientView productId={id} />;
}
