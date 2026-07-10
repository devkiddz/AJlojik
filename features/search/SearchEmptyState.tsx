'use client';

import { SearchX } from 'lucide-react';

type Props = {
  query: string;
};

export default function SearchEmptyState({ query }: Props) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-12 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <SearchX className="h-8 w-8 text-muted-foreground" />
      </div>

      <h3 className="text-base font-semibold">No results found</h3>

      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        We couldn't find anything matching <span className="font-medium text-foreground">"{query}"</span>.
      </p>
    </div>
  );
}
