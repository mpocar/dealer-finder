import {
  Category,
  FilterOptions,
  FiltersPanelProps,
  SortOption,
} from "@repo/db-mock";
import { useState, useEffect, useRef } from "react";

export const FiltersPanel = ({
  onFilterChange,
  categories,
  isLocating = false,
  locationError: externalLocationError = null,
}: FiltersPanelProps) => {
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    categories: [],
    selectedSubcategories: [],
    minPrice: null,
    maxPrice: null,
    sortBy: "recommended",
    useLocation: false,
    userLocation: null,
    radius: 10, // Default radius in miles
  });

  // Use internal state for inputs to enable debouncing
  const [searchInput, setSearchInput] = useState<string>("");
  const [minPriceInput, setMinPriceInput] = useState<string>("");
  const [maxPriceInput, setMaxPriceInput] = useState<string>("");
  const [radiusInput, setRadiusInput] = useState<number>(10);
  const [internalLocationError, setInternalLocationError] = useState<
    string | null
  >(null);

  // Use either external or internal location error
  const locationErrorToShow = externalLocationError || internalLocationError;

  const searchDebounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const priceDebounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const radiusDebounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Set initial values
  useEffect(() => {
    setSearchInput(filters.search);
    setMinPriceInput(
      filters.minPrice !== null ? filters.minPrice.toString() : ""
    );
    setMaxPriceInput(
      filters.maxPrice !== null ? filters.maxPrice.toString() : ""
    );
    setRadiusInput(filters.radius);
  }, [filters.search, filters.minPrice, filters.maxPrice, filters.radius]);

  // Get user's location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setInternalLocationError("Geolocation is not supported by your browser");
      return;
    }

    setInternalLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        const newFilters = {
          ...filters,
          userLocation: newLocation,
          useLocation: true,
        };

        setFilters(newFilters);
        onFilterChange(newFilters);
        setInternalLocationError(null);
      },
      (error) => {
        console.error("Error getting location:", error);
        setInternalLocationError(
          `Unable to get your location: ${error.message}`
        );

        // Turn off location filtering if we can't get the location
        const newFilters = {
          ...filters,
          useLocation: false,
          userLocation: null,
        };

        setFilters(newFilters);
        onFilterChange(newFilters);
      }
    );
  };

  // Toggle location filtering
  const handleLocationToggle = () => {
    if (!filters.useLocation) {
      // If turning on location, try to get user location
      getUserLocation();
    } else {
      // If turning off, clear location data
      const newFilters = {
        ...filters,
        useLocation: false,
      };
      setFilters(newFilters);
      onFilterChange(newFilters);
    }
  };

  // Handle radius change
  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const radius = parseInt(e.target.value);
    setRadiusInput(radius);

    // Clear any existing timeout
    if (radiusDebounceTimeout.current) {
      clearTimeout(radiusDebounceTimeout.current);
    }

    // Set a new timeout
    radiusDebounceTimeout.current = setTimeout(() => {
      const newFilters = {
        ...filters,
        radius,
      };
      setFilters(newFilters);
      onFilterChange(newFilters);
    }, 500); // 500ms delay
  };

  const debounceSearchChange = (searchTerm: string) => {
    // Clear any existing timeout
    if (searchDebounceTimeout.current) {
      clearTimeout(searchDebounceTimeout.current);
    }

    // Set a new timeout
    searchDebounceTimeout.current = setTimeout(() => {
      // Only apply search filter if there are at least 3 characters or it's empty (clearing search)
      const searchValue =
        searchTerm.trim().length >= 3 || searchTerm.trim() === ""
          ? searchTerm.trim()
          : filters.search;

      const newFilters = { ...filters, search: searchValue };
      setFilters(newFilters);
      onFilterChange(newFilters);
    }, 500); // 500ms delay
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    debounceSearchChange(value);
  };

  // Handle selecting a category (parent category)
  const handleCategoryChange = (category: string) => {
    let newCategories: Category[];

    // Find the full category object
    const categoryObj = categories.find((c) => c.category.name === category);

    if (!categoryObj) return;

    // Check if this category is already selected
    if (filters.categories.some((c) => c.category.name === category)) {
      // Remove this category and all its subcategories
      newCategories = filters.categories.filter(
        (c) => c.category.name !== category
      );

      // Also remove any selected subcategories from this category
      const newSelectedSubcategories = filters.selectedSubcategories.filter(
        (subName) =>
          !categoryObj.subcategories.some((sub) => sub.name === subName)
      );

      const newFilters = {
        ...filters,
        categories: newCategories,
        selectedSubcategories: newSelectedSubcategories,
      };
      setFilters(newFilters);
      onFilterChange(newFilters);
    } else {
      // Add this category
      newCategories = [...filters.categories, categoryObj];

      const newFilters = { ...filters, categories: newCategories };
      setFilters(newFilters);
      onFilterChange(newFilters);
    }
  };

  // Handle selecting a subcategory
  const handleSubcategoryChange = (
    categoryName: string,
    subcategoryName: string
  ) => {
    // Find the parent category object
    const categoryObj = categories.find(
      (c) => c.category.name === categoryName
    );
    if (!categoryObj) return;

    // Check if this subcategory is already selected
    if (filters.selectedSubcategories.includes(subcategoryName)) {
      // Remove this subcategory
      const newSelectedSubcategories = filters.selectedSubcategories.filter(
        (name) => name !== subcategoryName
      );

      const newFilters = {
        ...filters,
        selectedSubcategories: newSelectedSubcategories,
      };
      setFilters(newFilters);
      onFilterChange(newFilters);
    } else {
      // Add this subcategory
      const newSelectedSubcategories = [
        ...filters.selectedSubcategories,
        subcategoryName,
      ];

      // Also ensure the parent category is selected
      const newCategories = [...filters.categories];
      if (!newCategories.some((c) => c.category.name === categoryName)) {
        newCategories.push(categoryObj);
      }

      const newFilters = {
        ...filters,
        categories: newCategories,
        selectedSubcategories: newSelectedSubcategories,
      };
      setFilters(newFilters);
      onFilterChange(newFilters);
    }
  };

  const debouncePriceChange = (min: number | null, max: number | null) => {
    // Clear any existing timeout
    if (priceDebounceTimeout.current) {
      clearTimeout(priceDebounceTimeout.current);
    }

    // Set a new timeout
    priceDebounceTimeout.current = setTimeout(() => {
      const newFilters = { ...filters, minPrice: min, maxPrice: max };
      setFilters(newFilters);
      onFilterChange(newFilters);
    }, 500); // 500ms delay
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMinPriceInput(value);
    debouncePriceChange(value ? Number(value) : null, filters.maxPrice);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMaxPriceInput(value);
    debouncePriceChange(filters.minPrice, value ? Number(value) : null);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilters = { ...filters, sortBy: e.target.value as SortOption };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg shadow-md mb-6">
      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search deals... (min 3 characters)"
          value={searchInput}
          onChange={handleSearchChange}
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchInput.trim().length > 0 && searchInput.trim().length < 3 && (
          <div className="absolute right-3 top-2.5 text-amber-400 text-xs">
            Enter at least 3 characters
          </div>
        )}
      </div>

      {/* First row: Price range and Sort options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Price range filter */}
        <div>
          <h3 className="font-medium mb-2 text-gray-300">Price Range</h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPriceInput}
              onChange={handleMinPriceChange}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPriceInput}
              onChange={handleMaxPriceChange}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Sort options */}
        <div>
          <h3 className="font-medium mb-2 text-gray-300">Sort By</h3>
          <select
            value={filters.sortBy}
            onChange={handleSortChange}
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
          >
            <option value="recommended">Recommended</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
            <option value="discount-high-low">Discount: High to Low</option>
            <option value="rating-high-low">Rating: High to Low</option>
          </select>
        </div>
      </div>

      {/* Location filter row */}
      <div className="mb-4">
        <h3 className="font-medium mb-2 text-gray-300">Location</h3>
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="useLocation"
              checked={filters.useLocation}
              onChange={handleLocationToggle}
              disabled={isLocating}
              className="mr-2 h-4 w-4 rounded border-gray-700 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
            />
            <label htmlFor="useLocation" className="text-sm text-gray-300">
              Show deals near my location
              {isLocating && (
                <span className="ml-2 text-blue-400 text-xs inline-flex items-center">
                  <svg
                    className="animate-spin h-3 w-3 mr-1"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Getting location...
                </span>
              )}
            </label>
          </div>

          {filters.useLocation && (
            <div className="mt-2">
              <div className="flex items-center">
                <label className="w-12 text-sm text-gray-400 mr-2">
                  Radius:
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={radiusInput}
                  onChange={handleRadiusChange}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="ml-2 text-sm text-gray-300 w-16">
                  {radiusInput} miles
                </span>
              </div>

              {locationErrorToShow && (
                <div className="mt-2 text-red-400 text-xs">
                  {locationErrorToShow}
                </div>
              )}

              {filters.userLocation && (
                <div className="mt-2 text-xs text-gray-400 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Using your current location
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Categories row */}
      <div className="relative">
        <h3 className="font-medium mb-2 text-gray-300">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {categories &&
            categories.map((category) => (
              <div
                key={category.category.name}
                className="relative group mb-2"
                style={{ zIndex: 50 }}
              >
                <button
                  onClick={() => handleCategoryChange(category.category.name)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors h-[2.5rem] ${
                    filters.categories.some(
                      (c) => c.category.name === category.category.name
                    )
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {category.category.name}
                  {category.subcategories.length > 0 && (
                    <span className="ml-1.5 text-xs opacity-70">▼</span>
                  )}
                </button>

                {/* Subcategory dropdown */}
                {category.subcategories.length > 0 && (
                  <div
                    className="absolute hidden left-0 pt-2 w-48 group-hover:block"
                    style={{ zIndex: 100 }}
                  >
                    <div className="bg-gray-800 border border-gray-700 rounded shadow-lg overflow-hidden">
                      {category.subcategories.map((subcategory) => (
                        <button
                          key={subcategory.name}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSubcategoryChange(
                              category.category.name,
                              subcategory.name
                            );
                          }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-700 ${
                            filters.selectedSubcategories.includes(
                              subcategory.name
                            )
                              ? "bg-indigo-600/60 text-white"
                              : "text-gray-300"
                          }`}
                        >
                          {subcategory.name}
                          {filters.selectedSubcategories.includes(
                            subcategory.name
                          ) && (
                            <span className="float-right text-white">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Active filters display */}
      {(filters.search ||
        filters.categories.length > 0 ||
        filters.selectedSubcategories.length > 0 ||
        filters.minPrice ||
        filters.maxPrice ||
        filters.useLocation) && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-300">Active filters:</span>

            {filters.search && (
              <div className="bg-gray-800 text-gray-200 px-3 py-1 rounded-full text-xs flex items-center">
                Search: {filters.search}
                <button
                  onClick={() => {
                    const newFilters = { ...filters, search: "" };
                    setFilters(newFilters);
                    onFilterChange(newFilters);
                    setSearchInput("");
                  }}
                  className="ml-2 text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Display selected categories */}
            {filters.categories.map((category) => (
              <div
                key={category.category.name}
                className="bg-gray-800 text-gray-200 px-3 py-1 rounded-full text-xs flex items-center"
              >
                {category.category.name}
                <button
                  onClick={() => handleCategoryChange(category.category.name)}
                  className="ml-2 text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            ))}

            {/* Display selected subcategories */}
            {filters.selectedSubcategories.length > 0 &&
              categories &&
              categories.map((cat) => {
                const selectedSubs = cat.subcategories.filter((sub) =>
                  filters.selectedSubcategories.includes(sub.name)
                );

                return selectedSubs.map((sub) => (
                  <div
                    key={`${cat.category.name}-${sub.name}`}
                    className="bg-indigo-800 text-gray-200 px-3 py-1 rounded-full text-xs flex items-center"
                  >
                    {cat.category.name}: {sub.name}
                    <button
                      onClick={() =>
                        handleSubcategoryChange(cat.category.name, sub.name)
                      }
                      className="ml-2 text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                ));
              })}

            {/* Display location filter */}
            {filters.useLocation && (
              <div className="bg-green-800/80 text-gray-200 px-3 py-1 rounded-full text-xs flex items-center">
                Near Me ({radiusInput} miles)
                <button
                  onClick={() => {
                    const newFilters = { ...filters, useLocation: false };
                    setFilters(newFilters);
                    onFilterChange(newFilters);
                    setRadiusInput(10); // Reset radius input to default
                  }}
                  className="ml-2 text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            )}

            {(filters.minPrice !== null || filters.maxPrice !== null) && (
              <div className="bg-gray-800 text-gray-200 px-3 py-1 rounded-full text-xs flex items-center">
                Price:{" "}
                {filters.minPrice !== null ? `$${filters.minPrice}` : "$0"} -{" "}
                {filters.maxPrice !== null ? `$${filters.maxPrice}` : "Any"}
                <button
                  onClick={() => {
                    const newFilters = {
                      ...filters,
                      minPrice: null,
                      maxPrice: null,
                    };
                    setFilters(newFilters);
                    onFilterChange(newFilters);
                    setMinPriceInput("");
                    setMaxPriceInput("");
                  }}
                  className="ml-2 text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            )}

            <button
              onClick={() => {
                const newFilters = {
                  ...filters,
                  search: "",
                  categories: [],
                  selectedSubcategories: [],
                  minPrice: null,
                  maxPrice: null,
                  useLocation: false,
                  userLocation: null,
                };
                setFilters(newFilters);
                onFilterChange(newFilters);
                setSearchInput("");
                setMinPriceInput("");
                setMaxPriceInput("");
                setRadiusInput(10); // Reset radius input to default
              }}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
