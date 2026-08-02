import { notFound } from 'next/navigation';

import {
  ConversationWorkspace
} from '@/features/communication';
import {
  getCommunicationConversationForUser
} from '@/features/communication/server/communicationRepository';
import {
  resolveCommunicationWorkspace
} from '@/features/communication/server/resolveCommunicationWorkspace';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type InboxConversationPageProps = {
  params: Promise<{
    conversationId: string;
  }>;
};

export default async function InboxConversationPage({
  params
}: InboxConversationPageProps) {
  const { conversationId } = await params;
  const { userId, workspace } =
    await resolveCommunicationWorkspace(
      `/inbox/${conversationId}`
    );

  const conversation =
    await getCommunicationConversationForUser(
      conversationId,
      userId,
      workspace.id
    );

  if (!conversation) {
    notFound();
  }

  return (
    <ConversationWorkspace
      audience="customer"
      actorUserId={userId}
      initialConversation={conversation}
    />
  );
}
