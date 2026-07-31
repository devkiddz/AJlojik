import { NotificationCenter } from '@/features/notifications';
import { getNotificationCenter } from '@/features/notifications/server/notificationRepository';
import { resolveNotificationWorkspace } from '@/features/notifications/server/resolveNotificationWorkspace';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function NotificationsPage() {
  const { userId, workspace } =
    await resolveNotificationWorkspace('/notifications');

  const snapshot = await getNotificationCenter(
    userId,
    workspace.id,
    100
  );

  return <NotificationCenter initialSnapshot={snapshot} />;
}
