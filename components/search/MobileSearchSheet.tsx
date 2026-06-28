'use client';

import { X } from 'lucide-react';

import SearchBar from './SearchBar';
import SearchResultsDropdown from './SearchResultsDropdown';
import { useSearch } from '../providers/SearchProvider';

export default function MobileSearchSheet() {
  const { open, setOpen } = useSearch();

  if (!open) return null;

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]

        flex
        flex-col

        bg-background

        lg:hidden
      ">
      {/* Header */}

      <header
        className="
          flex
          items-center
          gap-3

          border-b

          px-4
          py-4
        ">
        <button
          type="button"
          aria-label="Close search"
          onClick={() => setOpen(false)}
          className="
            flex
            h-10
            w-10
            items-center
            justify-center

            rounded-full

            transition

            hover:bg-muted
          ">
          <X className="h-5 w-5" />
        </button>

        <div className="flex-1">
          <SearchBar />
        </div>
      </header>

      {/* Results */}

      <main className="flex-1 overflow-hidden">
        <SearchResultsDropdown mobile />
      </main>
    </div>
  );
}
