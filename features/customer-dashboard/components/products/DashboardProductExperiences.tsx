import { Heart, PackageCheck } from 'lucide-react';

import type {
  CommerceProduct
} from '../../contracts/customerDashboardTypes';
import { ProductExperienceSection } from './ProductExperienceSection';

type DashboardProductExperiencesProps = {
  suggestedProducts: CommerceProduct[];
  suggestedHref: string;
  pickedProducts: CommerceProduct[];
  pickedHref: string;
};

export function DashboardProductExperiences({
  suggestedProducts,
  suggestedHref,
  pickedProducts,
  pickedHref
}: DashboardProductExperiencesProps) {
  return (
    <section className="grid items-start gap-4 xl:grid-cols-2">
      <ProductExperienceSection
        code="SP"
        title="Suggested Products"
        icon={<PackageCheck />}
        products={suggestedProducts}
        href={suggestedHref}
      />

      <ProductExperienceSection
        code="PFY"
        title="Picked for You"
        icon={<Heart />}
        products={pickedProducts}
        href={pickedHref}
      />
    </section>
  );
}
