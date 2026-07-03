import { ProductType } from '@/types';

type Props = {
  product: ProductType;
};

export default function FeaturedProductCard({ product }: Props) {
  return <div>{product.name}</div>;
}
