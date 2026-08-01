'use client';

import { useCallback, useEffect, useState } from 'react';
import type { IntelligenceClientScope } from '../client';
import type { IntelligenceObservabilitySummary } from './observabilityContracts';

export function useIntelligenceObservability(scope: IntelligenceClientScope) {
  const [summary, setSummary] = useState<IntelligenceObservabilitySummary | null>(null);
  const [loading, setLoading] = useState(scope.audience === 'admin');
  const refresh = useCallback(async () => {
    if (scope.audience !== 'admin') { setLoading(false); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams({ audience: scope.audience, workspaceId: scope.workspaceId, hours: '24' });
      const response = await fetch(`/api/intelligence/observability?${params.toString()}`, { cache: 'no-store' });
      const payload = await response.json() as { summary?: IntelligenceObservabilitySummary };
      if (response.ok && payload.summary) setSummary(payload.summary);
    } finally { setLoading(false); }
  }, [scope]);
  useEffect(() => { const task = window.setTimeout(() => void refresh(), 0); return () => window.clearTimeout(task); }, [refresh]);
  return { summary, loading, refresh };
}
