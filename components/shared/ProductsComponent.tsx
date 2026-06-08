import { products } from '@/data/products';
import { categories } from '@/categories';
import ProductCard from './ProductsCards';
// import CategoriesRow from './CategoriesRow';
import CategoriesCarousel from './CategoriesCarousel';

export default function ProductsComponent() {
  return (
    <div className="w-full">
      <div className="w-full flex">
        <CategoriesCarousel categories={categories} />
      </div>
      <div className="relative top-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
