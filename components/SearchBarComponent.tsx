import { Search } from 'lucide-react';

export default function SearchBarComponent() {
  return (
    <div className="w-75 hidden md:inline-block">
      <div className="flex items-center h-12 backdrop-blur-xs rounded-full sm focus:shadow-md hover:shadow-md transition-shadow duration-200 pl-6 pr-2">
        <input
          type="text"
          placeholder="Search drinks, wines, whiskies..."
          className="flex-1 bg-transparent outline-none text-sm text-primary placeholder:text-gray-500 backdrop-blur-xs"
        />

        <button
          aria-label="search products"
          type="submit"
          className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-500 text-primary hover:bg-rose-600 transition-colors">
          <Search size={18} />
        </button>
      </div>
    </div>
  );
}
