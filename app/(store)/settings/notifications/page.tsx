import { NotificationSettingsPanel } from '@/features/notifications';
import { getNotificationCenter } from '@/features/notifications/server/notificationRepository';
import { resolveNotificationWorkspace } from '@/features/notifications/server/resolveNotificationWorkspace';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function NotificationSettingsPage() {
  const { userId, workspace } =
    await resolveNotificationWorkspace('/settings/notifications');

  const snapshot = await getNotificationCenter(
    userId,
    workspace.id,
    10
  );

  return <NotificationSettingsPanel initialSnapshot={snapshot} />;
}
