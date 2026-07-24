import {
  cookies,
  headers
} from 'next/headers';

import { redirect } from 'next/navigation';

import {
  CommerceExperienceDashboard,
  CommerceExperienceProvider,
  getCommerceDashboardData,
  resolveCommerceDashboard
} from '@/features/commerce-dashboard';

import {
  ACTIVE_WORKSPACE_COOKIE
} from '@/features/workspace/workspaceConstants';

import {
  getUserWorkspaces
} from '@/features/workspace/services/get-user-workspaces';

import { auth } from '@/lib/auth';

export default async function AccountPage() {
  const session =
    await auth.api.getSession({
      headers: await headers()
    });

  if (!session?.user?.id) {
    redirect(
      '/sign-in?returnTo=%2Faccount'
    );
  }

  const cookieStore =
    await cookies();

  const preferredWorkspaceId =
    cookieStore.get(
      ACTIVE_WORKSPACE_COOKIE
    )?.value ?? null;

  const workspaceRuntime =
    await getUserWorkspaces(
      session.user.id,
      preferredWorkspaceId
    );

  const activeWorkspace =
    workspaceRuntime.activeWorkspace;

  if (!activeWorkspace) {
    throw new Error(
      'AJ Logik could not resolve an active workspace for this account.'
    );
  }

  const dashboardData =
    await getCommerceDashboardData(
      session.user.id,
      activeWorkspace
    );

  const dashboardExperience =
    resolveCommerceDashboard(
      dashboardData
    );

  return (
    <CommerceExperienceProvider
      initialExperience={
        dashboardExperience
      }>
      <CommerceExperienceDashboard />
    </CommerceExperienceProvider>
  );
}
