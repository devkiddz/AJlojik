'use client';

import { useSearch } from '@/components/providers/SearchProvider';
import SearchResultItem from './SearchResultItem';

import { ProductType } from '@/types';

type Props = {
  products: ProductType[];
  query: string;

  activeIndex: number;

  onSelect: (product: ProductType) => void;
};

export default function SearchSuggestions({ products, query, activeIndex, onSelect }: Props) {
  const { setPreviewProduct } = useSearch();
  if (!products.length) return null;

  return (
    <section className="max-h-[450px] overflow-y-auto">
      <div className="space-y-1 p-2">
        {products.map((product, index) => (
          <SearchResultItem
            key={product.id}
            product={product}
            query={query}
            active={index === activeIndex}
            onClick={() => onSelect(product)}
            onMouseEnter={() => setPreviewProduct(product)}
          />
        ))}
      </div>
    </section>
  );
}
