import React from 'react';
import { Button } from '../ui/button';
import { categories } from '@/categories';
import { cn } from '@/lib/utils';

type Props = {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
};

//  <Button
//    variant="default"
//    className="bg-muted text-primary ring ring0-muted hover:ring-0 hover:bg-secondary cursor-pointer rounded-full text-xs">
//    Kitchen
//  </Button>;

export default function StoreCategoriesPill({ selectedCategory, onSelectCategory }: Props) {
  return (
    <div className="w-full min-w-0 overflow-x-auto scrollbar-hide">
      <div className="flex w-max min-w-full gap-2 py-1">
        {categories.map(category => (
          <Button
            key={category.id}
            onClick={() => onSelectCategory(category.slug)}
            className={cn(
              'h-9 shrink-0 rounded-full px-4 text-xs font-medium transition-all',
              selectedCategory === category.slug
                ? 'bg-secondary text-primary'
                : 'bg-muted text-muted-foreground ring-1 ring-border/40 hover:bg-muted/70'
            )}>
            {category.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

// export default function StoreCategoriesPill({ selectedCategory, onSelectCategory }: Props) {
//   return (
//     <div className="sticky md:h-auto flex md:p-2 rounded-md gap-2">
//       {categories.map(category => (
//         <button
//           key={category.id}
//           onClick={() => onSelectCategory(category.slug)}
//           className={selectedCategory === category.slug ? 'bg-primary text-white' : ''}>
//           {category.label}
//         </button>
//       ))}
//     </div>
//   );
// }
