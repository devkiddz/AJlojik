'use client';

import SearchBar from './SearchBar';
import SearchResultsDropdown from './SearchResultsDropdown';

import { useSearch } from '@/components/providers/SearchProvider';
import { X } from 'lucide-react';

export default function SearchMobileOverlay() {
  const { open, setOpen } = useSearch();
  console.log('Open:', open);

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
      <div className="border-b p-4">
        <div className="flex items-center gap-3">
          <button
            aria-label="close"
            onClick={() => setOpen(false)}
            className="rounded-full p-2 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>

          <div className="flex-1">
            <SearchBar />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <SearchResultsDropdown mobile />
      </div>
    </div>
  );
}
