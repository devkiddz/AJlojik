// components/promos/PromoRenderer.tsx

import { promos } from '@/data/promos';
import { ProductType } from '@/types/types';

import PromoSection from './PromoSection';

type Props = {
  products: ProductType[];
  onSelect?: (id: string) => void;
};

export default function PromoRenderer({ products, onSelect }: Props) {
  return <PromoSection promos={promos} products={products} onSelect={onSelect} />;
}
