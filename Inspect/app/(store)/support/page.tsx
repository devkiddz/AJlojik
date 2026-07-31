import Link from 'next/link';

import {
  ArrowRight,
  ClipboardList,
  Headphones,
  Package,
  ShoppingBag,
  Truck
} from 'lucide-react';

import {
  CustomerExperienceRouteMarker
} from '@/features/customer-experience/CustomerExperienceRouteMarker';

type SupportPageProps = {
  searchParams:
    Promise<
      Record<
        string,
        | string
        | string[]
        | undefined
      >
    >;
};

function readValue(
  value:
    | string
    | string[]
    | undefined
): string | null {
  if (
    Array.isArray(
      value
    )
  ) {
    return value[0]?.trim() ||
      null;
  }

  return value?.trim() ||
    null;
}

export default async function SupportPage({
  searchParams
}: SupportPageProps) {
  const params =
    await searchParams;

  const intent =
    readValue(
      params.intent
    );

  const targetId =
    readValue(
      params.targetId
    );

  const category =
    readValue(
      params.category
    );

  const order =
    readValue(
      params.order
    );

  const contextParts =
    [
      intent
        ? `Intent: ${intent}`
        : null,

      targetId
        ? `Target: ${targetId}`
        : null,

      category
        ? `Category: ${category}`
        : null,

      order
        ? `Order: ${order}`
        : null
    ].filter(
      (
        value
      ): value is string =>
        Boolean(
          value
        )
    );

  const contextLabel =
    contextParts.length >
    0
      ? contextParts.join(
          ' · '
        )
      : 'General customer assistance';

  const destinations =
    [
      {
        href:
          '/account/journey/orders',

        label:
          'Order questions',

        description:
          'Review order totals, payment and fulfilment records.',

        icon:
          Package
      },
      {
        href:
          '/account/journey/deliveries',

        label:
          'Delivery help',

        description:
          'Check tracking status, milestones and recent delivery events.',

        icon:
          Truck
      },
      {
        href:
          '/account#shopping-lists',

        label:
          'Shopping List assistance',

        description:
          'Review personal plans, publication state and list contents.',

        icon:
          ClipboardList
      },
      {
        href:
          '/store',

        label:
          'Product and Store help',

        description:
          'Return to products, promotions and category discovery.',

        icon:
          ShoppingBag
      }
    ];

  return (
    <main className="min-h-dvh px-3 py-5 sm:px-6 lg:px-8">
      <CustomerExperienceRouteMarker
        title="Customer support"
        subtitle={
          contextLabel
        }
        surface="support"
      />

      <div className="mx-auto max-w-[96rem] space-y-5">
        <header className="overflow-hidden rounded-[2rem] border border-border/60 bg-slate-950 p-5 text-white shadow-xl sm:p-8">
          <div className="flex max-w-3xl items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-emerald-200">
              <Headphones className="size-5" />
            </span>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200">
                Customer care foundation
              </p>

              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
                Support with your current AJ Logik context.
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
                This workspace preserves where you came from and routes you to the richest available customer records. Live case creation and support messaging are not active yet.
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.42fr)]">
          <article className="rounded-[2rem] border border-border/60 bg-card/80 p-5 shadow-sm sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
              Choose the affected journey
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {destinations.map(
                destination => {
                  const Icon =
                    destination.icon;

                  return (
                    <Link
                      key={
                        destination.href
                      }
                      href={
                        destination.href
                      }
                      className="group rounded-3xl border border-border/60 bg-background/60 p-4 transition hover:border-primary/30 hover:bg-muted/60">
                      <div className="flex items-start justify-between gap-3">
                        <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                          <Icon className="size-4" />
                        </span>

                        <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5" />
                      </div>

                      <h2 className="mt-4 text-sm font-black">
                        {
                          destination.label
                        }
                      </h2>

                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        {
                          destination.description
                        }
                      </p>
                    </Link>
                  );
                }
              )}
            </div>
          </article>

          <article className="rounded-[2rem] border border-primary/20 bg-primary/5 p-5 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
              Preserved context
            </p>

            <p className="mt-3 text-sm font-black">
              {
                contextLabel
              }
            </p>

            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              The future Support Engine will use this context when creating a case or starting a customer conversation. This foundation does not claim that a support ticket has been submitted.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
