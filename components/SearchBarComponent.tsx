'use client';

import SearchBar from './search/SearchBar';
import SearchMobileOverlay from './search/SearchMobileOverlay';
import SearchResultsDropdown from './search/SearchResultsDropdown';

export default function SearchBarComponent() {
  return (
    <>
      <SearchBar />

      <div className="hidden lg:block">
        <SearchResultsDropdown />
      </div>
    </>
  );
}
