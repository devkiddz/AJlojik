import { Heart, PackageCheck } from 'lucide-react';

import type { resolveCustomerDashboardView } from '../../view/resolveCustomerDashboardView';

import { ProductExperienceSection } from './ProductExperienceSection';

type CustomerDashboardView = ReturnType<typeof resolveCustomerDashboardView>;

type DashboardProductExperiencesProps = {
  view: CustomerDashboardView;
};

export function DashboardProductExperiences({ view }: DashboardProductExperiencesProps) {
  const { suggestedProducts, suggestedHref, pickedProducts, pickedHref } = view;

  return (
    <section className="grid items-start gap-4 xl:grid-cols-2">
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
        icon={<Heart />}
        products={pickedProducts}
        href={pickedHref}
        source="picked-for-you"
      />
    </section>
  );
}
