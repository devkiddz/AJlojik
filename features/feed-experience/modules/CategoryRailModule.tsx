'use client';

import StoreCategoryCard from '@/components/store/StoreCategoryCard';

import type { CategoryRailModule as CategoryRailModuleType, FeedActions } from '../contracts';

type CategoryRailModuleProps = {
  module: CategoryRailModuleType;
  actions: FeedActions;
};

export function CategoryRailModule({ module, actions }: CategoryRailModuleProps) {
  const { categories, selectedCategory } = module.data;

  if (!categories.length) {
    return null;
  }

  return (
    <section aria-label="Shop by category" className="min-w-0">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
        {categories.map(category => {
          const active = selectedCategory === category.slug;

          return (
            <StoreCategoryCard
              key={category.id}
              category={category}
              active={active}
              onClick={() =>
                actions.changeCategory({
                  category: category.slug
                })
              }
            />
          );
        })}
      </div>
    </section>
  );
}
