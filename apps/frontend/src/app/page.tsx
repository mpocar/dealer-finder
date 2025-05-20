"use client";

import { DealsList } from "./components/DealsList";
import { FiltersPanel } from "./components/FiltersPanel";
import { useDealsData } from "../hooks/useDealsData";
import { useFilters } from "../hooks/useFilters";

export default function DealsPage() {
  const { filters, handleFilterChange, locationState } = useFilters();

  const { deals, categories, loading, loadingCategories, errorMessage } =
    useDealsData({ filters });

  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      {/* Header */}
      <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-center shadow-md">
        <h1 className="text-3xl font-bold text-white">Dealer Finder</h1>
      </header>

      {/* Content */}
      <div className="container mx-auto p-4">
        {!loadingCategories && (
          <FiltersPanel
            onFilterChange={handleFilterChange}
            categories={categories}
            isLocating={locationState.isLocating}
            locationError={locationState.locationError}
          />
        )}

        {/* Error message display */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-white">
            <p className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errorMessage}
            </p>
          </div>
        )}

        <h2 className="text-2xl font-bold mb-6 text-white">
          {loading
            ? "Loading Deals..."
            : deals.length === 0
              ? "No Deals Found"
              : `Available Deals (${deals.length})`}
        </h2>

        <DealsList deals={deals} loading={loading} />
      </div>
    </div>
  );
}
