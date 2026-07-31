'use client';

import SearchBar from '@/features/search/SearchBar';
import SearchResultsDropdown from '@/features/search/SearchResultsDropdown';

export default function SearchBarComponent() {
  return (
    <div className="relative w-full">
      {' '}
      {/* Added relative wrapper to align the dropdown context */}
      <SearchBar />
      <div className="hidden xl:flex">
        <SearchResultsDropdown />
      </div>
    </div>
  );
}
