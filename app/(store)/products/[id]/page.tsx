import ProductPageClientView from '@/components/store/ProductPageClientView';
import { products } from '@/data/products';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductPage({ params }: Props) {
  const { id } = await params;

  const product = products.find(p => p.id.trim() === id.trim() || p.slug.trim() === id.trim());

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl py-24 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
        Product Build Entry Not Found
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground antialiased selection:bg-accent selection:text-accent-foreground">
      <ProductPageClientView product={product} />
    </main>
  );
}
