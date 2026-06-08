'use client';

import CategoryCard from './CategoryCard';
import { CategoryType } from '@/types';

type Props = {
  categories: CategoryType[];
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
            min-w-55
            sm:min-w-65
            snap-start
          ">
          <CategoryCard category={category} />
        </div>
      ))}
    </div>
  );
}
