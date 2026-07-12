'use client';

import { cn } from '@/lib/utils';

import type { MockExperienceProfile, MockExperienceProfileId } from '../mocks';

type MockExperienceSwitcherProps = {
  profiles: MockExperienceProfile[];
  activeProfileId: MockExperienceProfileId;

  onChange: (profileId: MockExperienceProfileId) => void;
};

export function MockExperienceSwitcher({ profiles, activeProfileId, onChange }: MockExperienceSwitcherProps) {
  return (
    <div className="mb-4 rounded-2xl border bg-card/70 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Experience Tester
      </p>

      <div className="flex flex-wrap gap-2">
        {profiles.map(profile => (
          <button
            key={profile.id}
            type="button"
            onClick={() => onChange(profile.id)}
            className={cn(
              'rounded-full px-4 py-2 text-xs font-semibold transition',
              activeProfileId === profile.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            )}>
            {profile.label}
          </button>
        ))}
      </div>
    </div>
  );
}
