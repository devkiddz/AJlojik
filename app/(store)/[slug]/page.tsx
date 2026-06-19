import { notFound } from 'next/navigation';

export const categories = [
  { slug: 'kitchen', label: 'Kitchen' },
  { slug: 'wines', label: 'Wines' },
  { slug: 'party-plans', label: 'Party Plans' }
];

export default function ShopPage({ params }: { params?: { slug?: string } }) {
  const slug = params?.slug;

  if (!slug) {
    return notFound();
  }

  const normalizedSlug = slug.toLowerCase().trim();

  const category = categories.find(c => c.slug === normalizedSlug);

  if (!category) {
    return notFound();
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{category.label}</h1>

      <p className="text-muted-foreground mt-2">Showing products for {category.slug}</p>
    </div>
  );
}
