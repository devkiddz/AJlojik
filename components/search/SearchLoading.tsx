'use client';

export default function SearchLoading() {
  return (
    <div className="space-y-3 p-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="
            flex
            items-center
            gap-3
            rounded-xl
            p-2
            animate-pulse
          ">
          {/* Image */}
          <div className="h-14 w-14 rounded-xl bg-muted" />

          {/* Text */}
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 rounded bg-muted" />

            <div className="h-3 w-full rounded bg-muted" />

            <div className="h-3 w-1/3 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
