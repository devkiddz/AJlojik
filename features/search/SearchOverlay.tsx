'use client';

import SearchBar from './SearchBar';
import SearchResultsDropdown from './SearchResultsDropdown';

import { useSearch } from '@/providers/SearchProvider';

export default function SearchOverlay() {
  const { open } = useSearch();

  if (!open) return null;

  return (
    <div
      onClick={e => e.stopPropagation()}
      className="
                absolute
                left-1/2
                top-20
                z-50
                w-[min(1180px,96vw)]
                -translate-x-1/2
            ">
      <SearchBar />
      <SearchResultsDropdown />
    </div>
  );
}
