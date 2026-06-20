import { CategoryType } from '@/types';
import StoreCategoryCard from '@/components/store/StoreCategoryCard';

type Props = {
  categories: CategoryType[];
};

export default function StoreCategoryTrack({ categories }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
      {categories.map(category => (
        <StoreCategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}
