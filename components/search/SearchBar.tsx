'use client';

import { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { useSearch } from '@/components/providers/SearchProvider';

export default function SearchBar() {
  const {
    query,
    setQuery,
    setActiveIndex,
    open,
    setOpen,

    loading
  } = useSearch();

  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  /* ------------------------------ */
  /* Keyboard Shortcut */
  /* ------------------------------ */

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();

        inputRef.current?.focus();

        setOpen(true);
      }

      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', listener);

    return () => window.removeEventListener('keydown', listener);
  }, [setOpen]);

  /* ------------------------------ */
  /* Click Outside */
  /* ------------------------------ */

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClick);

    return () => document.removeEventListener('mousedown', handleClick);
  }, [setOpen]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div
        className="
          flex
          h-11
          items-center
          rounded-full
          border
          bg-background
          shadow-sm
          transition-all
          focus-within:border-primary
          focus-within:ring-2
          focus-within:ring-primary/10
        ">
        <Search className="ml-4 h-4 w-4 text-muted-foreground" />

        <input
          onFocus={() => {
            setOpen(true);
            setActiveIndex(0);
          }}
          ref={inputRef}
          value={query}
          //  onFocus={() => setOpen(true)}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search products, wines, kitchen..."
          className="
            flex-1
            bg-transparent
            px-3
            text-sm
            outline-none
          "
        />

        {loading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        )}

        {!loading && query && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setQuery('')}
            className="mr-1 h-8 w-8 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        )}

        <kbd
          className="
            mr-2
            hidden
            rounded-md
            border
            bg-muted
            px-2
            py-1
            text-[10px]
            text-muted-foreground
            lg:block
          ">
          Ctrl K
        </kbd>
      </div>
    </div>
  );
}
