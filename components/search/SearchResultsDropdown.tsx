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

import { useSearch } from './SearchProvider';

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
      className={
        mobile
          ? 'flex h-full flex-col overflow-hidden bg-background'
          : 'absolute left-0 top-full mt-3 w-[min(1180px,96vw)] overflow-hidden rounded-b-3xl border border-t-0 bg-background/95 backdrop-blur-xl shadow-2xl z-50'
      }>
      {loading ? (
        <SearchLoading />
      ) : (
        <div className={`grid ${showPreview ? 'grid-cols-12' : 'grid-cols-1'} h-[75vh] overflow-hidden`}>
          {/* LEFT PANEL */}
          <div
            className={`relative overflow-y-auto p-6 space-y-8 ${showPreview ? 'col-span-7' : 'col-span-12'}`}>
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
                onSelect={selectProduct}
              />
            ) : (
              <SearchEmptyState query={query} />
            )}
          </div>

          {/* RIGHT PANEL (ASIDE) */}
          {showPreview && (
            <aside className="col-span-5 h-full overflow-y-auto scrollbar-none border-l bg-muted/10 p-6">
              <SearchPreview product={previewProduct ?? undefined} />
            </aside>
          )}
        </div>
      )}

      {/* FOOTER */}
      <div className="overflow-x-auto border-t bg-background px-6 py-3 scrollbar-none">
        <SearchShortcut />
      </div>

      {/* KEYBOARD */}
      <SearchKeyboard
        open={open}
        total={results.length}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
        onClose={() => setOpen(false)}
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
