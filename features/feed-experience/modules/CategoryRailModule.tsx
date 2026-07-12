"use client";

import StoreCategoryCard from "@/components/store/StoreCategoryCard";
import type { CategoryRailModule as CategoryRailModuleType, FeedActions } from "../contracts";

type Props = { module: CategoryRailModuleType; actions: FeedActions };
export function CategoryRailModule({ module, actions }: Props) {
  const { categories, selectedCategory } = module.data;
  return <section><div className="grid grid-cols-2 gap-2 pt-2 md:grid-cols-3 xl:grid-cols-3">{categories.map((category) => <StoreCategoryCard key={category.id} category={category} active={selectedCategory === category.slug} onClick={() => actions.changeCategory({ category: category.slug })} />)}</div></section>;
}
