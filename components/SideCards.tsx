'use client';

import Image from 'next/image';

// Mocking the category schema matching your e-commerce structure
const featuredCategories = [
  {
    id: 'cat_kitchen',
    slug: 'kitchen',
    name: 'Kitchen Logik',
    desc: 'Professional-grade culinary appliances and kitchen essentials.',
    image: '/products/KitchenAid_Artisan_Stand_Mixer.jpg',
    size: 'large'
  },
  {
    id: 'cat_wines',
    slug: 'wines',
    name: 'AJ Vinez',
    desc: 'Premium wines & luxury champagnes.',
    image: '/products/moet-chandon-imperial_lg.jpg',
    size: 'small'
  },
  {
    id: 'cat_party',
    slug: 'party-plans',
    name: 'Party Plans',
    desc: 'Live catering & complete event hosting setup.',
    image: '/products/Birthday_Party_Package.jpg',
    size: 'small'
  }
];

export default function FeaturedCategoriesGrid() {
  const hero = featuredCategories.find(item => item.size === 'large');

  const cards = featuredCategories.filter(item => item.size === 'small');

  return (
    <section className="w-full px-1">
      <div className="flex flex-col space-y-3 ">
        {/* HERO */}
        {hero && (
          <article className="group relative overflow-hidden rounded-xl cursor-pointer aspect-16/9">
            <Image
              src={hero.image}
              alt={hero.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

            <div className="absolute bottom-0 left-0 z-10 p-6">
              <span className="rounded-md border border-orange-500/20 bg-orange-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-orange-400">
                Flagship Store
              </span>

              <h3 className="mt-3 text-3xl font-bold text-white">{hero.name}</h3>

              <p className="mt-2 max-w-md text-sm text-neutral-200">{hero.desc}</p>
            </div>
          </article>
        )}

        {/* BOTTOM CARDS */}
        <div className="grid grid-cols-2 gap-1 aspect-16/7">
          {cards.map(card => (
            <article key={card.id} className="group relative overflow-hidden rounded-xl cursor-pointer">
              <Image
                src={card.image}
                alt={card.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              <div className="absolute bottom-0 left-0 z-10 p-4">
                <h3 className="text-base font-semibold text-white">{card.name}</h3>

                <p className="mt-1 line-clamp-2 text-xs text-neutral-300">{card.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
