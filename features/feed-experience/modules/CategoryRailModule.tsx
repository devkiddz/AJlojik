"use client";

import StoreCategoryCard from "@/components/store/StoreCategoryCard";
import type { CategoryRailModule as CategoryRailModuleType, FeedActions } from "../contracts";

type Props = { module: CategoryRailModuleType; actions: FeedActions };
export function CategoryRailModule({ module, actions }: Props) {
  const { categories, selectedCategory } = module.data;
  return <section><div className="flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth pt-2 pb-3 scrollbar-none">{categories.map((category) => <div key={category.id} className="w-40 shrink-0 snap-start sm:w-48"><StoreCategoryCard category={category} active={selectedCategory === category.slug} onClick={() => actions.changeCategory({ category: category.slug })} /></div>)}</div></section>;
}
