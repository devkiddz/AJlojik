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
    <div className="sticky md:h-auto flex md:p-2 rounded-md gap-2">
      {categories.map(category => (
        <Button
          variant="default"
          // className="bg-muted text-primary ring ring0-muted hover:ring-0 hover:bg-secondary cursor-pointer rounded-full text-xs"
          key={category.id}
          onClick={() => onSelectCategory(category.slug)}
          className={`rounded-full px-4 py-2 text-xs font-medium transition-all duration-200 cursor-pointer
            ${
              selectedCategory === category.slug
                ? 'bg-secondary text-primary'
                : 'bg-muted text-muted-foreground ring-1 ring-border/40 hover:bg-muted/70 hover:text-foreground'
            }`}>
          {category.label}
        </Button>
      ))}
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
