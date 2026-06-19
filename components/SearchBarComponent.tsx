import { Search } from 'lucide-react';

export default function SearchBarComponent() {
  return (
    <div className="flex h-10 w-full items-center gap-2 rounded-full shadow-md bg-muted">
      <input
        type="text"
        placeholder="Search drinks, wines, whiskies..."
        className="flex-1  outline-none p-4 rounded-full text-sm"
      />

      <button
        aria-label="search products"
        type="submit"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-white hover:bg-rose-600">
        <Search size={18} />
      </button>
    </div>
  );
}
