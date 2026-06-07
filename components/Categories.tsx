'use client';

import CategoryCard from './shared/CategoryCard';
import { Button } from './ui/button';

export type CategoryType = {
  id: string;
  name: string;
  type: string;
  image: string;
};

// const categories = [
//   {
//     id: '1',
//     name: 'Red Wine',
//     type: 'Liquors',
//     image: 'https://source.unsplash.com/800x600/?red-wine'
//   },
//   {
//     id: '2',
//     name: 'BBQ Chicken',
//     type: 'Kitchen',
//     image: 'https://source.unsplash.com/800x600/?bbq-chicken'
//   },
//   {
//     id: '3',
//     name: 'Cakes',
//     type: 'Bakery',
//     image: 'https://source.unsplash.com/800x600/?cake,bakery'
//   },
//   {
//     id: '4',
//     name: 'Confectionaries',
//     type: 'Snacks',
//     image: 'https://source.unsplash.com/800x600/?candy,sweets'
//   },
//   {
//     id: '5',
//     name: 'Soft Drinks',
//     type: 'Beverages',
//     image: 'https://source.unsplash.com/800x600/?soft-drinks,coca-cola'
//   },
//   {
//     id: '6',
//     name: 'Fish',
//     type: 'Seafood',
//     image: 'https://source.unsplash.com/800x600/?fish,seafood'
//   }
// ];

export const categories = [
  {
    id: '1',
    name: 'Red Wine',
    type: 'Liquors',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: '2',
    name: 'BBQ Chicken',
    type: 'Kitchen',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: '3',
    name: 'Cakes',
    type: 'Bakery',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: '4',
    name: 'Confectionaries',
    type: 'Snacks',
    image: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: '5',
    name: 'Soft Drinks',
    type: 'Beverages',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: '6',
    name: 'Fish',
    type: 'Seafood',
    image: 'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?q=80&w=1200&auto=format&fit=crop'
  }
];
export default function Categories() {
  return (
    // <div className="flex items-center px-2 md:px-4 py-2 w-full sticky top-0 bg-primary-foreground/80 z-10 backdrop-blur-lg shadow-lg overflow-hidden">
    <section className="relative w-full -top-30 items-center bg-primary-foreground/50 backdrop-blur-lg shadow-lg overflow-hidden px-6 rounded-lg">
      <div className=" w-[calc(100%-2rem)] ">
        <div className="flex flex-row items-center justify-between p-6 bg-muted/10">
          <h2 className="font-semibold text-xl">Explore Categories</h2>

          <button className="text-sm text-primary bg-muted/10 py-2 px-5 rounded-full shadow-2xl cursor-pointer">
            View All
          </button>
        </div>

        <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto scrollbar-none justify-evenly py-4">
          {categories.map(category => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
    // </div>
  );
}
