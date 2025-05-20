import { useState, useEffect } from "react";
import type {
  Deal,
  Category,
  UseDealsDataProps,
  UseDealsDataResult,
} from "@repo/db-mock";

export function useDealsData({
  filters,
}: UseDealsDataProps): UseDealsDataResult {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  return {
    deals,
    categories,
    loading,
    loadingCategories,
    errorMessage,
  };
}
