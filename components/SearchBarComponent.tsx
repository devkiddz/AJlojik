'use client';

import SearchBar from './search/SearchBar';
import SearchResultsDropdown from './search/SearchResultsDropdown';

export default function SearchBarComponent() {
  return (
    <div className="relative w-full">
      {' '}
      {/* Added relative wrapper to align the dropdown context */}
      <SearchBar />
      <div className="hidden lg:block">
        <SearchResultsDropdown />
      </div>
    </div>
  );
}
