'use client';

import CategoryCard from './CategoryCard';
import { categoryType } from '@/types';

type Props = {
  categories: categoryType[];
};

export default function CategoriesRow({ categories }: Props) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory scrollbar-hide">
      {categories.map(category => (
        <div key={category.id} className="snap-start shrink-0">
          <CategoryCard category={category} />
        </div>
      ))}
    </div>
  );
}
