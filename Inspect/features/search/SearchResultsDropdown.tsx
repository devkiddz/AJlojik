'use client';

import SearchLoading from './SearchLoading';
import SearchHistory from './SearchHistory';
import SearchTrending from './SearchTrending';
import SearchCategories from './SearchCategories';
import SearchSuggestions from './SearchSuggestions';
import SearchEmptyState from './SearchEmptyState';
import SearchShortcut from './SearchShortcut';
import SearchKeyboard from './SearchKeyboard';
import SearchPreview from './SearchPreview';
import { useSearch } from '@/providers/SearchProvider';

type Props = {
  mobile?: boolean;
};

export default function SearchResultsDropdown({ mobile = false }: Props) {
  const {
    open,
    setOpen,
    loading,
    query,
    results,
    activeIndex,
    setActiveIndex,
    previewProduct,
    recentSearches,
    trendingProducts,
    selectHistory,
    selectCategory,
    selectProduct,
    removeHistory,
    clearHistory
  } = useSearch();

  if (!open) return null;

  const showPreview = query.trim() !== '';

  return (
    <div
      data-search-dropdown="true"
      onClick={e => e.stopPropagation()}
      className={
        mobile
          ? 'flex h-full w-full flex-col overflow-y-auto bg-transparent'
          : 'absolute left-0 -translate-x-1/2 top-full mt-3 w-[min(1180px,96vw)] overflow-hidden rounded-3xl border bg-background/95 backdrop-blur-xl shadow-2xl z-999'
      }>
      {loading ? (
        <SearchLoading />
      ) : (
        /* 🚀 FIXED: Removed overflow-hidden from the grid matrix wrapper so children columns can independently track scroll positions */
        <div
          className={`grid grid-cols-1 ${
            showPreview && !mobile ? 'lg:grid-cols-12' : ''
          } h-full lg:max-h-[65vh]`}>
          {/* RESULTS COLUMN PANEL */}
          <div
            className={`overflow-y-auto px-6 py-4 space-y-6 custom-scrollbar h-full col-span-1 ${
              showPreview && !mobile ? 'lg:col-span-7' : 'lg:col-span-12'
            }`}>
            {query.trim() === '' ? (
              <>
                <SearchHistory
                  history={recentSearches}
                  onSelect={selectHistory}
                  onRemove={removeHistory}
                  onClear={clearHistory}
                />
                <SearchTrending products={trendingProducts} onSelect={selectProduct} />
                <SearchCategories onSelect={selectCategory} />
              </>
            ) : results.length ? (
              <SearchSuggestions
                products={results}
                query={query}
                activeIndex={activeIndex}
                onSelect={product => {
                  selectProduct(product);
                }}
              />
            ) : (
              <SearchEmptyState query={query} />
            )}
          </div>

          {/* DESKTOP EXCLUSIVE PREVIEW COLUMN */}
          {showPreview && !mobile && (
            /* 🚀 FIXED: Added strict max-height context matching the parent container boundary wrapper to trigger the viewport scroll track */
            <aside className="hidden lg:block lg:col-span-5 max-h-[65vh] overflow-y-auto border-l bg-muted/5 p-5 scrollbar-thin scrollbar-thumb-muted-foreground/20">
              <SearchPreview product={previewProduct ?? undefined} />
            </aside>
          )}
        </div>
      )}

      {/* SHUTDOWN ACCESSIBILITY CAP */}
      {!mobile && (
        <div className="hidden lg:block border-t bg-background px-6 py-2.5">
          <SearchShortcut />
        </div>
      )}

      <SearchKeyboard
        open={open}
        total={results.length}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
        onClose={() => setOpen(false)}
        desktopOnly={!mobile}
        onSelect={() => {
          const product = results[activeIndex];
          if (product) {
            selectProduct(product);
          }
        }}
      />
    </div>
  );
}
