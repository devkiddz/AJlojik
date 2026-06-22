'use client';

export default function RecentlyViewed() {
  // later: localStorage or API
  return (
    <div className="space-y-2">
      <p className="text-xs text-zinc-400 uppercase">Recently Viewed</p>

      <div className="text-sm text-zinc-300">
        {/* placeholder */}
        No recent items yet
      </div>
    </div>
  );
}
