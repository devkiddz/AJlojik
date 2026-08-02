import {
  InboxWorkspace
} from '@/features/communication';
import {
  getVendorCommunicationInbox
} from '@/features/communication/server/communicationRepository';
import {
  requireVendorPermission
} from '@/features/vendor/auth/vendorAccess';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function VendorInboxPage() {
  const access =
    await requireVendorPermission(
      'communication:view'
    );

  const snapshot =
    await getVendorCommunicationInbox(
      access.vendor.id,
      access.workspace.id,
      100
    );

  return (
    <InboxWorkspace
      audience="vendor"
      initialSnapshot={snapshot}
      vendorName={access.vendor.name}
    />
  );
}
