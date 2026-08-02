import { notFound } from 'next/navigation';

import {
  ConversationWorkspace
} from '@/features/communication';
import {
  getCommunicationConversationForVendor
} from '@/features/communication/server/communicationRepository';
import {
  requireVendorPermission
} from '@/features/vendor/auth/vendorAccess';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type VendorConversationPageProps = {
  params: Promise<{
    conversationId: string;
  }>;
};

export default async function VendorConversationPage({
  params
}: VendorConversationPageProps) {
  const { conversationId } = await params;
  const access =
    await requireVendorPermission(
      'communication:view'
    );

  const conversation =
    await getCommunicationConversationForVendor(
      conversationId,
      access.vendor.id,
      access.workspace.id
    );

  if (!conversation) {
    notFound();
  }

  return (
    <ConversationWorkspace
      audience="vendor"
      actorUserId={access.session.user.id}
      initialConversation={conversation}
    />
  );
}
