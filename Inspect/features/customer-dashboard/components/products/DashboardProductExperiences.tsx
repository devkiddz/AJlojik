import { Heart, PackageCheck } from 'lucide-react';

import type { CustomerDashboardView } from '../../view/resolveCustomerDashboardView';

import { ProductExperienceSection } from './ProductExperienceSection';

type DashboardProductExperiencesProps = {
  view: CustomerDashboardView;
};

export function DashboardProductExperiences({ view }: DashboardProductExperiencesProps) {
  const { suggestedProducts, suggestedHref, pickedProducts, pickedHref } = view;

  return (
    <section className="space-y-4">
      <ProductExperienceSection
        code="SP"
        title="Suggested Products"
        icon={<PackageCheck />}
        products={suggestedProducts}
        href={suggestedHref}
        source="suggested"
      />

      <ProductExperienceSection
        code="PFY"
        title="Picked for You"
        icon={<Heart className="fill-current" />}
        products={pickedProducts}
        href={pickedHref}
        source="picked-for-you"
      />
    </section>
  );
}
