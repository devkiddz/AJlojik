'use client';

import { useState } from 'react';

import { useIdentity } from '@/providers/IdentityProvider';

import StoreExperienceSidebar from './StoreExperienceSidebar';

export default function HomeMobileDiscoveryHost() {
  const { user, isAuthenticated } = useIdentity();
  const [collapsed, setCollapsed] = useState(true);

  return (
    <StoreExperienceSidebar
      tier={user?.tier ?? 'guest'}
      authenticated={isAuthenticated}
      collapsed={collapsed}
      onCollapsedChange={setCollapsed}
      mobileOnly
    />
  );
}
