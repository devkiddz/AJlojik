import {
  AssistantRuntimePage
} from '@/features/ai-assistance';

import {
  getVendorAccess
} from '@/features/vendor/auth/vendorAccess';

export default async function VendorAssistantPage() {
  const access =
    await getVendorAccess();

  return (
    <AssistantRuntimePage
      audience="vendor"
      initialWorkspaceId={
        access.workspace.id
      }
      vendorProfileId={
        access.vendor.id
      }
      contextLabel={`${access.vendor.name} · ${access.membership.role.replaceAll('_', ' ')}`}
    />
  );
}
