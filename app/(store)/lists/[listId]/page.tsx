import Link from 'next/link';
import { ArrowLeft, Globe2, ListPlus, ShoppingBag } from 'lucide-react';
import { notFound } from 'next/navigation';

import { PublicShoppingListProductCard } from '@/features/shopping-lists/components/PublicShoppingListProductCard';
import { ShoppingListRepository } from '@/features/shopping-lists/server/shoppingListRepository';

type Props = {
  params: Promise<{ listId: string }>;
};

const money = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0
});

export default async function PublicShoppingListPage({ params }: Props) {
  const { listId } = await params;
  const list = await ShoppingListRepository.getApprovedPublicById(listId);

  if (!list) notFound();

  const resolvedList = list as NonNullable<typeof list>;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <Link href="/store" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Back to Store
      </Link>

      <header className="relative mt-5 overflow-hidden rounded-[2rem] border bg-card p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <Globe2 className="size-3.5" />
            Admin-approved public list
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">{resolvedList.name}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            {resolvedList.description ?? 'A customer-curated shopping plan shared with the AJ Logik community.'}
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
            <span className="rounded-full border bg-background/70 px-3 py-1.5">{resolvedList.itemCount} products</span>
            <span className="rounded-full border bg-background/70 px-3 py-1.5">{resolvedList.totalQuantity} planned items</span>
            <span className="rounded-full border bg-background/70 px-3 py-1.5">{money.format(resolvedList.totalValue)}</span>
          </div>
        </div>
      </header>

      <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {resolvedList.items.map(item => {
          const image = item.variant?.image ?? item.product.variants[0]?.image ?? '/placeholder.svg';
          const price = item.promotion?.promotionalPrice ?? item.variant?.price ?? item.product.variants[0]?.price ?? 0;

          return (
            <PublicShoppingListProductCard
              key={item.id}
              productId={item.product.id}
              productName={item.product.name}
              productDescription={item.product.shortDescription}
              image={image}
              quantity={item.quantity}
              formattedPrice={money.format(price)}
            />
          );
        })}
      </section>

      <section className="mt-8 flex flex-col gap-4 rounded-3xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ListPlus className="size-4" />
            <h2 className="font-semibold">Build your own shopping plan</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Create a private list first; you decide whether it should ever be submitted publicly.</p>
        </div>
        <Link href="/account/lists?create=true" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-foreground px-5 text-sm font-semibold text-background">
          <ShoppingBag className="size-4" />
          Create my list
        </Link>
      </section>
    </main>
  );
}
