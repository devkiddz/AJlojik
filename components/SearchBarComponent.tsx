'use client';

import SearchBar from './search/SearchBar';
import SearchMobileOverlay from './search/SearchMobileOverlay';
import SearchProvider from './search/SearchProvider';
import SearchResultsDropdown from './search/SearchResultsDropdown';

export default function SearchBarComponent() {
  return (
    <SearchProvider>
      <SearchBar />

      <div className="hidden lg:block">
        <SearchResultsDropdown />
      </div>

      <SearchMobileOverlay />
    </SearchProvider>
  );
}
