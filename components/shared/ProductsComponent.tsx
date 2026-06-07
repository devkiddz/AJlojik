import { products } from '@/data/products';
import Categories from '../Categories';
import ProductCard from './ProductsCards';

export default function ProductsComponent() {
  return (
    <div>
      <div>
        <Categories />
      </div>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
        {products.map(product => (
          <ProductCard key={product.id} products={products} />
        ))}
      </div>
    </div>
  );
}
