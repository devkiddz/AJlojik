'use client';

import SearchBar from './SearchBar';
import SearchResultsDropdown from './SearchResultsDropdown';
import { useSearch } from '@/components/providers/SearchProvider';
import { X } from 'lucide-react';

export default function SearchMobileOverlay() {
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
        bg-background/80
        backdrop-blur-xl
        lg:hidden
        animate-in
        fade-in
        duration-200
      "
      onClick={() => setOpen(false)}>
      {/* Search Header Context */}
      <div className="border-b p-4 bg-background/50 backdrop-blur-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <button
            aria-label="close"
            onClick={() => setOpen(false)}
            className="rounded-full p-2 hover:bg-muted transition-colors active:scale-95">
            <X className="h-5 w-5" />
          </button>

          <div className="flex-1">
            <SearchBar />
          </div>
        </div>
      </div>

      {/* Mobile Workspace Engine Layout */}
      <div className="flex-1 overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* 🚀 FIXED: Added the explicit 'mobile' prop so it renders inline lists safely */}
        <SearchResultsDropdown mobile />
      </div>
    </div>
  );
}
