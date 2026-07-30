import { AssistantFoundationPage } from '@/features/ai-assistance';
import { getVendorAccess } from '@/features/vendor/auth/vendorAccess';

export default async function VendorAssistantPage() {
  const access = await getVendorAccess();

  return (
    <AssistantFoundationPage
      audience="vendor"
      contextLabel={`${access.vendor.name} · ${access.membership.role.replaceAll('_', ' ')}`}
    />
  );
}
