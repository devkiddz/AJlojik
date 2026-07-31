import { notFound } from 'next/navigation';

import { promos } from '@/data/promos';
import PromoCampaignExperience from '@/features/promotion/PromoCampaignExperience';

type PromoPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PromoPage({ params }: PromoPageProps) {
  const { slug } = await params;
  const promo = promos.find(item => item.slug === slug);

  if (!promo) {
    notFound();
  }

  return <PromoCampaignExperience promo={promo} />;
}
