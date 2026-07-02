import { collections } from '@/data/collections';
import CollectionSection from './CollectionSection';

export default function HomeCollections() {
  return (
    <>
      {collections.map(collection => (
        <CollectionSection key={collection.id} collection={collection} />
      ))}
    </>
  );
}
