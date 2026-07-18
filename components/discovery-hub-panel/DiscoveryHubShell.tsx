import { hubGroups, hubWidgets } from '@/data/discoveryHubData';

import DiscoveryHubPanel from './DiscoveryHubPanel';
import { DiscoveryHubProvider } from '../../providers/DiscoveryHubProvider';

export default async function DiscoveryHubShell() {
  // Later:
  // const session = await auth();
  // const hub = await getDiscoveryHub(session?.user.id);

  const hub = {
    groups: hubGroups,
    widgets: hubWidgets
  };

  return (
    <DiscoveryHubProvider groups={hub.groups} widgets={hub.widgets}>
      <DiscoveryHubPanel />
    </DiscoveryHubProvider>
  );
}
