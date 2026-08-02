import { notFound } from 'next/navigation';

import {
  CustomerSupportCaseWorkspace
} from '@/features/support/components/CustomerSupportCaseWorkspace';
import {
  getCustomerSupportCase
} from '@/features/support/server/supportRepository';
import {
  resolveCommunicationWorkspace
} from '@/features/communication/server/resolveCommunicationWorkspace';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type SupportCasePageProps = {
  params: Promise<{
    caseId: string;
  }>;
};

export default async function SupportCasePage({
  params
}: SupportCasePageProps) {
  const { caseId } = await params;
  const { userId, workspace } =
    await resolveCommunicationWorkspace(
      `/support/${caseId}`
    );

  const supportCase =
    await getCustomerSupportCase(
      caseId,
      userId,
      workspace.id
    );

  if (!supportCase) {
    notFound();
  }

  return (
    <CustomerSupportCaseWorkspace
      actorUserId={userId}
      initialCase={supportCase}
    />
  );
}
