import { Button } from '../ui/button';
import { categories } from '@/categories';
import { cn } from '@/lib/utils';

type Props = {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
};

export default function StoreCategoriesPill({ selectedCategory, onSelectCategory }: Props) {
  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex w-max min-w-full gap-3 py-1">
        {categories.map(category => {
          const active = selectedCategory === category.slug;

          return (
            <Button
              key={category.id}
              variant="ghost"
              onClick={() => onSelectCategory(category.slug)}
              className={cn(
                'h-10 shrink-0 rounded-full px-3 text-sm font-semibold tracking-tight transition-all duration-300',
                active
                  ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground scale-[1.02]'
                  : 'bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground'
              )}>
              {category.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
