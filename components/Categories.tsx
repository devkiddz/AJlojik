'use client';

import CategoryCard from './shared/CategoryCard';
import { categoryType } from '@/types';

type Props = {
  categories: categoryType[];
};

export default function CategoriesRow({ categories }: Props) {
  return (
    <div
      className="
        flex
        gap-4
        overflow-x-auto
        px-2
        pb-4
        scroll-smooth
        snap-x
        snap-mandatory
        scrollbar-hide
      ">
      {categories.map(category => (
        <div
          key={category.id}
          className="
            min-w-[220px]
            sm:min-w-[260px]
            snap-start
            flex-shrink-0
          ">
          <CategoryCard category={category} />
        </div>
      ))}
    </div>
  );
}
