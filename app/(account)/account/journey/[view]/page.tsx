import {
  notFound,
  redirect
} from 'next/navigation';

const journeyDestinations = {
  'recent-views': '/store?view=recent',
  wishlist: '/wishlist',
  cart: '/cart',
  activity: '/account#activity-archive',
  orders: '/orders',
  deliveries: '/orders?status=active'
} as const;

type JourneyView =
  keyof typeof journeyDestinations;

type AccountJourneyPageProps = {
  params: Promise<{
    view: string;
  }>;
};

export default async function AccountJourneyPage({
  params
}: AccountJourneyPageProps) {
  const {
    view
  } = await params;

  if (
    !(view in journeyDestinations)
  ) {
    notFound();
  }

  redirect(
    journeyDestinations[
      view as JourneyView
    ]
  );
}
