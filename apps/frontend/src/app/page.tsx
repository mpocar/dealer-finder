"use client";

import { useEffect, useState, useMemo } from "react";
import type { Deal, Category } from "@repo/db-mock";
import { DealsList } from "./components/DealsList";
import { FilterOptions, FiltersPanel } from "./components/FiltersPanel";

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    categories: [],
    selectedSubcategories: [],
    minPrice: null,
    maxPrice: null,
    sortBy: "recommended",
    useLocation: false,
    userLocation: null,
    radius: 10,
  });

  // Fetch categories
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`)
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories);
        setLoadingCategories(false);
      })
      .catch((err) => {
        console.error("Failed to fetch categories", err);
        setLoadingCategories(false);
      });
  }, []);

  // Fetch deals
  useEffect(() => {
    setLoading(true);
    setErrorMessage(null); // Clear any previous error messages

    setTimeout(() => {
      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/deals`);

      // Add search parameter - only if it has at least 3 characters
      if (filters.search && filters.search.trim().length >= 3) {
        url.searchParams.append("search", filters.search);
      }

      // Add sorting parameter
      if (filters.sortBy !== "recommended") {
        url.searchParams.append("sortBy", filters.sortBy);
      }

      // Add price range parameters
      if (filters.minPrice !== null) {
        url.searchParams.append("minPrice", filters.minPrice.toString());
      }

      if (filters.maxPrice !== null) {
        url.searchParams.append("maxPrice", filters.maxPrice.toString());
      }

      // Add category parameters as a single comma-separated string
      if (filters.categories.length > 0) {
        const categoryNames = filters.categories
          .map((cat) => cat.category.name)
          .join(",");
        url.searchParams.append("categories", categoryNames);
      }

      // Add subcategory parameters if any are selected
      if (filters.selectedSubcategories.length > 0) {
        url.searchParams.append(
          "subcategories",
          filters.selectedSubcategories.join(",")
        );
      }

      // Add location parameters if location filtering is enabled
      if (filters.useLocation && filters.userLocation) {
        url.searchParams.append(
          "latitude",
          filters.userLocation.lat.toString()
        );
        url.searchParams.append(
          "longitude",
          filters.userLocation.lng.toString()
        );
        url.searchParams.append("radius", filters.radius.toString());
      }

      fetch(url.toString())
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          setDeals(data.deals || []);

          // Handle any message from the API
          if (data.message) {
            setErrorMessage(data.message);
          } else {
            setErrorMessage(null);
          }

          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch deals", err);
          setDeals([]);
          setErrorMessage(
            "An error occurred while fetching deals. Please try again later."
          );
          setLoading(false);
        });
    }, 1500);
  }, [
    filters.search,
    filters.sortBy,
    filters.minPrice,
    filters.maxPrice,
    filters.categories,
    filters.selectedSubcategories,
    filters.useLocation,
    filters.userLocation,
    filters.radius,
  ]);

  // All filtering is now handled by the backend API
  const filteredDeals = useMemo(() => {
    return deals || [];
  }, [deals]);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

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

        <DealsList deals={filteredDeals} loading={loading} />
      </div>
    </div>
  );
}
