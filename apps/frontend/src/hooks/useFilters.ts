import { useState } from "react";
import { FilterOptions } from "@repo/db-mock";
import { useLocationService } from "./useLocationService";

export function useFilters() {
  // Get location service
  const { userLocation, locationError, isLocating, getUserLocation } =
    useLocationService();

  // Initialize filters with default values
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

  // Enhanced filter handler with location support
  const handleFilterChange = (newFilters: FilterOptions) => {
    // If location is being turned on but we don't have a location yet
    if (newFilters.useLocation && !newFilters.userLocation && !userLocation) {
      getUserLocation().then((location) => {
        if (location) {
          setFilters({
            ...newFilters,
            userLocation: location,
          });
        } else {
          // If we couldn't get location, turn off location filtering
          setFilters({
            ...newFilters,
            useLocation: false,
          });
        }
      });
    } else if (newFilters.useLocation && userLocation) {
      // If turning on location and we already have it
      setFilters({
        ...newFilters,
        userLocation,
      });
    } else {
      // Normal filter update
      setFilters(newFilters);
    }
  };

  return {
    filters,
    setFilters,
    handleFilterChange,
    locationState: {
      userLocation,
      locationError,
      isLocating,
    },
  };
}
