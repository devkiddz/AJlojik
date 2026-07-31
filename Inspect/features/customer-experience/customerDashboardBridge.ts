export type CustomerDashboardRuntimeSnapshot = {
  recentProductIds: string[];
  preferredCategorySlugs: string[];
  hubSignals: Array<{
    id: string;
    groupId: string;
    title: string;
    description: string;
    priority: number;
    badge: string | null;
    href: string | null;
    productIds: string[];
  }>;
};

type SnapshotListener = (snapshot: CustomerDashboardRuntimeSnapshot) => void;

let latestSnapshot: CustomerDashboardRuntimeSnapshot | null = null;
const listeners = new Set<SnapshotListener>();

export function publishCustomerDashboardRuntime(
  snapshot: CustomerDashboardRuntimeSnapshot
): void {
  latestSnapshot = snapshot;

  listeners.forEach(listener => listener(snapshot));
}

export function readCustomerDashboardRuntime(): CustomerDashboardRuntimeSnapshot | null {
  return latestSnapshot;
}

export function subscribeCustomerDashboardRuntime(listener: SnapshotListener): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
