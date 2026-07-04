'use client';

import StoreCategoryCard from '../store/StoreCategoryCard';
import { useDiscovery } from './DiscoveryProvider';

export default function DiscoveryCategoryRail() {
  const { triggerRef, categories, selectedCategory, onCategoryChange } = useDiscovery();

  return (
    <section ref={triggerRef}>
      <div className="grid grid-cols-2 gap-2 pt-2 md:grid-cols-3 xl:grid-cols-3">
        {categories.map(category => (
          <StoreCategoryCard
            key={category.id}
            category={category}
            active={selectedCategory === category.slug}
            onClick={() =>
              onCategoryChange({
                category: category.slug
              })
            }
          />
        ))}
      </div>
    </section>
  );
}
