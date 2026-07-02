import { CollectionType } from '@/data/collections';
import ProductsCarousel from '../ProductsCarousel';
import FeaturedProductCard from '../shared/FeaturedProductCard';
import CollectionBanner from './CollectionBanner';

type Props = {
  collection: CollectionType;
};

export default function CollectionSection({ collection }: Props) {
  const products = collection.productIds.map(id => productsData.find(p => p.id === id)).filter(Boolean);

  const featured = productsData.find(p => p.id === collection.featuredProductId);

  return (
    <section>
      {collection.banners?.length > 0 && <CollectionBanner banners={collection.banners} />}

      {featured && <FeaturedProductCard product={featured} />}

      <ProductsCarousel title={collection.title} category={collection.id} products={products} />
    </section>
  );
}
