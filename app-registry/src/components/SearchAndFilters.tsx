'use client';

import { APPLICATION_CATEGORIES, APPLICATION_STATUSES } from '@/types/database';
import { ApplicationFilters } from '@/types/database';

interface SearchAndFiltersProps {
  filters: ApplicationFilters;
  onFiltersChange: (filters: ApplicationFilters) => void;
  developers: string[];
  technologies: string[];
}

export default function SearchAndFilters({
  filters,
  onFiltersChange,
  developers,
  technologies,
}: SearchAndFiltersProps) {
  const updateFilter = (key: keyof ApplicationFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== ''
  ).length;

  return (
    <div className="glass-card p-4 sm:p-5 mb-5">
      {/* Search bar */}
      <div className="relative mb-3.5 w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <input
          id="search-input"
          type="text"
          placeholder="Search applications by name, developer, technology, or category..."
          value={filters.search || ''}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="form-input search-input-field w-full h-10 text-sm"
        />
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap gap-2.5 items-center">
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-600 font-semibold uppercase tracking-wider mr-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Filters
        </div>

        <select
          id="filter-category"
          value={filters.category || ''}
          onChange={(e) => updateFilter('category', e.target.value)}
          className="form-select text-xs py-2 max-w-[160px]"
        >
          <option value="">All Categories</option>
          {APPLICATION_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          id="filter-status"
          value={filters.status || ''}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="form-select text-xs py-2 max-w-[150px]"
        >
          <option value="">All Statuses</option>
          {APPLICATION_STATUSES.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        <select
          id="filter-technology"
          value={filters.technology || ''}
          onChange={(e) => updateFilter('technology', e.target.value)}
          className="form-select text-xs py-2 max-w-[160px]"
        >
          <option value="">All Technologies</option>
          {technologies.map((tech) => (
            <option key={tech} value={tech}>{tech}</option>
          ))}
        </select>

        <select
          id="filter-existing"
          value={filters.is_existing ?? ''}
          onChange={(e) => updateFilter('is_existing', e.target.value)}
          className="form-select text-xs py-2 max-w-[140px]"
        >
          <option value="">Existing / New</option>
          <option value="true">Existing</option>
          <option value="false">New</option>
        </select>

        <select
          id="filter-developer"
          value={filters.developer || ''}
          onChange={(e) => updateFilter('developer', e.target.value)}
          className="form-select text-xs py-2 max-w-[160px]"
        >
          <option value="">All Developers</option>
          {developers.map((dev) => (
            <option key={dev} value={dev}>{dev}</option>
          ))}
        </select>

        {activeFilterCount > 0 && (
          <button
            id="clear-filters-btn"
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 hover:text-black bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 transition-colors px-2.5 py-1.5 rounded-lg ml-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Clear Filters ({activeFilterCount})
          </button>
        )}
      </div>
    </div>
  );
}
