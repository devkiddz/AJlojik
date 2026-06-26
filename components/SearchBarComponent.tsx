'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, Clock3, Sparkles } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const trending = ['Hennessy', 'Jameson', 'Moët', 'Red Wine', 'Kitchen', 'Champagne'];

export default function SearchBarComponent() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [query, setQuery] = useState(params.get('q') ?? '');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const recent = useMemo(() => {
    if (typeof window === 'undefined') return [];

    return JSON.parse(localStorage.getItem('aj_recent_searches') ?? '[]') as string[];
  }, [open]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const next = new URLSearchParams(params.toString());

      if (query.trim()) {
        next.set('q', query);
      } else {
        next.delete('q');
      }

      router.replace(`${pathname}?${next.toString()}`, {
        scroll: false
      });
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }

      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', listener);

    return () => window.removeEventListener('keydown', listener);
  }, []);

  const saveSearch = () => {
    if (!query.trim()) return;

    const searches = [query, ...recent.filter(item => item !== query)].slice(0, 6);

    localStorage.setItem('aj_recent_searches', JSON.stringify(searches));

    setOpen(false);
  };

  return (
    <div className="relative w-full">
      <div className="flex h-10 items-center rounded-full border bg-background shadow-sm transition focus-within:border-primary">
        <Search className="ml-4 h-4 w-4 text-muted-foreground" />

        <input
          ref={inputRef}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              saveSearch();
            }
          }}
          placeholder="Search products..."
          className="flex-1 bg-transparent px-3 text-sm outline-none"
        />

        {query && (
          <button
            type="button"
            aria-label="search"
            onClick={() => setQuery('')}
            className="mr-2 rounded-full p-1 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        )}

        <kbd className="mr-2 hidden rounded border bg-muted px-2 py-1 text-[10px] text-muted-foreground lg:block">
          Ctrl K
        </kbd>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl border bg-background shadow-xl">
          {!query && (
            <>
              <div className="border-b p-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                  <Sparkles className="h-3 w-3" />
                  Trending
                </div>

                <div className="flex flex-wrap gap-2">
                  {trending.map(item => (
                    <button
                      key={item}
                      onClick={() => setQuery(item)}
                      className="rounded-full bg-muted px-3 py-1 text-sm hover:bg-secondary hover:text-white">
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {recent.length > 0 && (
                <div className="p-4">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                    <Clock3 className="h-3 w-3" />
                    Recent
                  </div>

                  {recent.map(item => (
                    <button
                      key={item}
                      onClick={() => setQuery(item)}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-muted">
                      <Clock3 className="h-4 w-4 text-muted-foreground" />
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {query && (
            <div className="p-3 text-sm text-muted-foreground">
              Press <strong>Enter</strong> to search for{' '}
              <span className="font-medium text-foreground">"{query}"</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
