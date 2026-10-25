import type { VehicleCategory } from '../../lib/api';

const CATEGORIES: VehicleCategory[] = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Van', 'Electric', 'Hybrid'];

export interface SearchFiltersState {
  make: string;
  model: string;
  category: VehicleCategory | '';
  minPrice: string;
  maxPrice: string;
}

interface SearchFilterBarProps {
  filters: SearchFiltersState;
  onChange: (f: SearchFiltersState) => void;
  onSearch: () => void;
  onClear: () => void;
  isLoading: boolean;
}

export function SearchFilterBar({ filters, onChange, onSearch, onClear, isLoading }: SearchFilterBarProps) {
  const hasFilters = filters.make || filters.model || filters.category || filters.minPrice || filters.maxPrice;

  const set = (field: keyof SearchFiltersState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => onChange({ ...filters, [field]: e.target.value });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <div className="card p-4 mb-6">
      <div className="flex flex-wrap gap-3 items-end">
        {/* Make text search */}
        <div className="flex-1 min-w-[180px]">
          <label className="input-label">Search by make</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              className="input pl-9"
              placeholder="Toyota, Ford…"
              value={filters.make}
              onChange={set('make')}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        <div className="flex-1 min-w-[180px]">
          <label className="input-label">Search by model</label>
          <input
            type="text"
            className="input"
            placeholder="Camry, Civic…"
            value={filters.model}
            onChange={set('model')}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Category */}
        <div className="min-w-[140px]">
          <label className="input-label">Category</label>
          <select className="select" value={filters.category} onChange={set('category')}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Price range */}
        <div className="min-w-[120px]">
          <label className="input-label">Min price</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
            <input type="number" className="input pl-6" placeholder="0" min={0}
              value={filters.minPrice} onChange={set('minPrice')} onKeyDown={handleKeyDown} />
          </div>
        </div>
        <div className="min-w-[120px]">
          <label className="input-label">Max price</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
            <input type="number" className="input pl-6" placeholder="∞" min={0}
              value={filters.maxPrice} onChange={set('maxPrice')} onKeyDown={handleKeyDown} />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button onClick={onSearch} className="btn-primary" disabled={isLoading}>
            {isLoading ? (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
            Search
          </button>
          {hasFilters && (
            <button onClick={onClear} className="btn-secondary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
