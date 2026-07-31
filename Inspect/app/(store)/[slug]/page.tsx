import { notFound } from 'next/navigation';

const shopCategories = [
  { slug: 'kitchen', label: 'Kitchen' },
  { slug: 'wines', label: 'Wines' },
  { slug: 'party-plans', label: 'Party Plans' }
] as const;

type ShopPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ShopPage({ params }: ShopPageProps) {
  const { slug } = await params;
  const normalizedSlug = slug.toLowerCase().trim();

  const category = shopCategories.find(item => item.slug === normalizedSlug);

  if (!category) {
    notFound();
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{category.label}</h1>

      <p className="mt-2 text-muted-foreground">Showing products for {category.slug}</p>
    </div>
  );
}
