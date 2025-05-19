import { api } from "encore.dev/api";
import {
  Deal,
  FilterCriteria,
  sampleDeals,
  Category,
  VALID_SORT_OPTIONS,
  DealsRequestParams,
  DealsResponse,
  UserLocation,
} from "@repo/db-mock";

// GET /deals endpoint
export const listDeals = api(
  { method: "GET", path: "/deals", expose: true },
  async (req: DealsRequestParams): Promise<DealsResponse> => {
    try {
      // Extract and validate query parameters
      const search = req.search ? req.search.trim() : "";
      const sortBy = req.sortBy || "recommended";

      // Validate sortBy parameter
      if (!VALID_SORT_OPTIONS.includes(sortBy)) {
        return {
          deals: [],
          message: `Invalid sort option '${sortBy}'. Valid options are: ${VALID_SORT_OPTIONS.join(", ")}`,
        };
      }

      // Parse and validate numerical parameters
      const minPrice = validateNumberParam(req.minPrice, "minPrice");
      const maxPrice = validateNumberParam(req.maxPrice, "maxPrice");
      const latitude = validateNumberParam(req.latitude, "latitude", -90, 90);
      const longitude = validateNumberParam(
        req.longitude,
        "longitude",
        -180,
        180
      );
      const radius = validateNumberParam(req.radius, "radius", 0, 500) || 10; // Default 10 miles

      // Validate price range
      if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
        return {
          deals: [],
          message: "minPrice cannot be greater than maxPrice",
        };
      }

      // Validate location parameters - both lat and long must be provided together
      if (
        (latitude === null && longitude !== null) ||
        (latitude !== null && longitude === null)
      ) {
        return {
          deals: [],
          message: "Both latitude and longitude must be provided together",
        };
      }

      // Convert comma-separated strings to arrays
      const categories: string[] = req.categories
        ? req.categories.split(",").map((c) => c.trim())
        : [];
      const subcategories: string[] = req.subcategories
        ? req.subcategories.split(",").map((c) => c.trim())
        : [];

      // Start with all deals
      let filteredDeals: Deal[] = [...sampleDeals];

      // Apply search filter
      if (search && search.length >= 3) {
        const searchLower = search.toLowerCase();
        filteredDeals = filteredDeals.filter(
          (deal) =>
            deal.title.toLowerCase().includes(searchLower) ||
            deal.description.toLowerCase().includes(searchLower) ||
            deal.tags.some((tag) => tag.toLowerCase().includes(searchLower)) ||
            deal.merchantName.toLowerCase().includes(searchLower)
        );
      }

      // Apply category filter
      if (categories.length > 0) {
        filteredDeals = filteredDeals.filter((deal) =>
          categories.includes(deal.category)
        );
      }

      // Apply subcategory filter
      if (subcategories.length > 0) {
        filteredDeals = filteredDeals.filter((deal) =>
          subcategories.includes(deal.subcategory)
        );
      }

      // Apply price range filters
      if (minPrice !== null) {
        filteredDeals = filteredDeals.filter(
          (deal) => deal.discountPrice >= minPrice
        );
      }

      if (maxPrice !== null) {
        filteredDeals = filteredDeals.filter(
          (deal) => deal.discountPrice <= maxPrice
        );
      }

      // Apply location filter
      if (latitude !== null && longitude !== null) {
        filteredDeals = filteredDeals.filter((deal) => {
          // Calculate distance between deal and user location
          const distance = calculateDistance(
            latitude,
            longitude,
            deal.location.lat,
            deal.location.lng
          );
          return distance <= radius;
        });
      }

      console.log(`Sorting by: ${sortBy}`);

      // Apply sorting
      switch (sortBy) {
        case "price-low-high":
          console.log("Sorting by price low to high");
          filteredDeals.sort((a, b) => a.discountPrice - b.discountPrice);
          break;
        case "price-high-low":
          console.log("Sorting by price high to low");
          filteredDeals.sort((a, b) => b.discountPrice - a.discountPrice);
          break;
        case "discount-high-low":
          console.log("Sorting by discount percentage high to low");
          filteredDeals.sort(
            (a, b) => b.discountPercentage - a.discountPercentage
          );
          break;
        case "rating-high-low":
          console.log("Sorting by rating high to low");
          filteredDeals.sort((a, b) => b.averageRating - a.averageRating);
          break;
        case "recommended":
        default:
          console.log(
            "Using weighted scoring algorithm for recommended sorting"
          );
          const userLocation: UserLocation = {
            latitude,
            longitude,
            radius,
          };
          filteredDeals.sort((a, b) => {
            const scoreA = calculateRecommendationScore(a, userLocation);
            const scoreB = calculateRecommendationScore(b, userLocation);

            return scoreB - scoreA;
          });
          break;
      }

      // Handle no results case
      if (filteredDeals.length === 0) {
        return {
          deals: [],
          message:
            "No deals found matching your criteria. Try adjusting your filters.",
        };
      }

      return {
        deals: filteredDeals,
      };
    } catch (error) {
      // Log the error and return a generic error
      console.error("Error processing deals request:", error);
      return {
        deals: [],
        message: "An unexpected error occurred while processing your request",
      };
    }
  }
);

// Helper function to validate and parse numeric parameters
function validateNumberParam(
  value: string | undefined,
  paramName: string,
  min?: number,
  max?: number
): number | null {
  if (!value) return null;

  const parsedValue = parseFloat(value);

  if (isNaN(parsedValue)) {
    throw new Error(`Invalid ${paramName} parameter: must be a number`);
  }

  if (min !== undefined && parsedValue < min) {
    throw new Error(`Invalid ${paramName} parameter: must be at least ${min}`);
  }

  if (max !== undefined && parsedValue > max) {
    throw new Error(`Invalid ${paramName} parameter: must be at most ${max}`);
  }

  return parsedValue;
}

// Helper function to calculate distance between two coordinates (using Haversine formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in miles
}

// Scoring algorithm for recommended deals
export function calculateRecommendationScore(
  deal: Deal,
  userLocation: UserLocation
): number {
  // Weights for different factors (sum to 1.0)
  const DISCOUNT_WEIGHT = 0.3;
  const DISTANCE_WEIGHT = 0.2;
  const RATING_WEIGHT = 0.15;
  const FEATURED_WEIGHT = 0.15;
  const POPULARITY_WEIGHT = 0.2;

  let score = 0;

  // Discount score (0-100%)
  score += deal.discountPercentage * DISCOUNT_WEIGHT;

  // Distance score (closer is better)
  if (userLocation.latitude !== null && userLocation.longitude !== null) {
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      deal.location.lat,
      deal.location.lng
    );

    // Convert distance to a 0-1 score (1 being closest)
    // If distance = 0, score = 1
    // If distance >= radius, score = 0
    const distanceScore = Math.max(0, 1 - distance / userLocation.radius);
    score += distanceScore * DISTANCE_WEIGHT;
  } else {
    // If no location provided, we give full distance points
    // to avoid penalizing deals when no location is given
    score += DISTANCE_WEIGHT;
  }

  // Rating score (0-5 converted to 0-1)
  const ratingScore = deal.averageRating / 5;
  score += ratingScore * RATING_WEIGHT;

  // Featured bonus
  if (deal.featuredDeal) {
    score += FEATURED_WEIGHT;
  }

  // Popularity score based on quantity sold
  // Normalize against a reasonable max (e.g., 1000 items sold)
  const POPULARITY_MAX = 1000;
  const popularityScore = Math.min(1, deal.quantitySold / POPULARITY_MAX);
  score += popularityScore * POPULARITY_WEIGHT;

  return score;
}
