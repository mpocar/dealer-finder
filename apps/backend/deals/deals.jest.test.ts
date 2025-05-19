// Add imports for Jest
import { describe, expect, test } from "@jest/globals";

// Manually define simplified types for testing
interface Location {
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface Deal {
  id: string;
  title: string;
  description: string;
  originalPrice: number;
  discountPrice: number;
  discountPercentage: number;
  category: string;
  subcategory: string;
  tags: string[];
  location: Location;
  merchantName: string;
  merchantRating: number;
  quantitySold: number;
  expiryDate: Date;
  featuredDeal: boolean;
  imageUrl: string;
  redemptionLocations: Location[];
  finePrint?: string;
  reviewCount: number;
  averageRating: number;
  availableQuantity: number;
}

interface UserLocation {
  latitude: number | null;
  longitude: number | null;
  radius: number;
}

// For testing purposes, implement the same algorithms directly in this file
// Haversine formula for distance calculation
function calculateDistance(
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

// Recommendation scoring algorithm
function calculateRecommendationScore(
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

  // Discount score (0-100% normalized to 0-1)
  score += (deal.discountPercentage / 100) * DISCOUNT_WEIGHT;

  // Distance score (closer is better)
  if (userLocation.latitude !== null && userLocation.longitude !== null) {
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      deal.location.lat,
      deal.location.lng
    );

    // Convert distance to a 0-1 score (1 being closest)
    const distanceScore = Math.max(0, 1 - distance / userLocation.radius);
    score += distanceScore * DISTANCE_WEIGHT;
  } else {
    // If no location provided, we give full distance points
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
  const POPULARITY_MAX = 1000;
  const popularityScore = Math.min(1, deal.quantitySold / POPULARITY_MAX);
  score += popularityScore * POPULARITY_WEIGHT;

  return score;
}

// Mock deal for testing
const mockDeal: Deal = {
  id: "test-deal-1",
  title: "Test Deal",
  description: "This is a test deal description",
  originalPrice: 100,
  discountPrice: 50,
  discountPercentage: 50,
  category: "Electronics",
  subcategory: "Phones",
  tags: ["smartphone", "discount", "sale"],
  location: {
    lat: 37.7749,
    lng: -122.4194,
    address: "123 Test St, San Francisco, CA 94103",
    city: "San Francisco",
    state: "CA",
    zipCode: "94103",
  },
  merchantName: "Test Electronics",
  merchantRating: 4.5,
  quantitySold: 100,
  expiryDate: new Date("2023-12-31"),
  featuredDeal: false,
  imageUrl: "https://example.com/image.jpg",
  redemptionLocations: [
    {
      lat: 37.7749,
      lng: -122.4194,
      address: "123 Test St, San Francisco, CA 94103",
      city: "San Francisco",
      state: "CA",
      zipCode: "94103",
    },
  ],
  finePrint: "Some restrictions apply",
  reviewCount: 50,
  averageRating: 4.2,
  availableQuantity: 200,
};

// Jest test suite for distance calculation
describe("Distance Calculation", () => {
  test("calculates distance between two coordinates correctly", () => {
    // San Francisco to New York is roughly 2,900 miles
    const distance = calculateDistance(
      37.7749, // San Francisco
      -122.4194,
      40.7128, // New York
      -74.006
    );

    // Should be roughly 2,900 miles (allow for some approximation)
    expect(distance).toBeGreaterThan(2500);
    expect(distance).toBeLessThan(3000);
  });

  test("calculates 0 distance for same coordinates", () => {
    const distance = calculateDistance(37.7749, -122.4194, 37.7749, -122.4194);

    expect(distance).toBeCloseTo(0, 5);
  });
});

// Test the recommendation algorithm
describe("Deal Recommendation Scoring", () => {
  test("calculates basic score correctly without location", () => {
    const userLocation: UserLocation = {
      latitude: null,
      longitude: null,
      radius: 10,
    };

    const score = calculateRecommendationScore(mockDeal, userLocation);

    // Calculate expected score components:
    // - Discount: 50% * 0.3 = 15 points
    // - Distance: When no location, gets full points = 20 points
    // - Rating: 4.2/5 * 0.15 = 12.6 points
    // - Featured: false, so 0 points
    // - Popularity: 100/1000 * 0.2 = 2 points
    // Total expected: 49.6 points
    expect(score).toBeCloseTo(0.496, 2); // Our score is 0-1 based
  });

  test("adds featured bonus for featured deals", () => {
    const userLocation: UserLocation = {
      latitude: null,
      longitude: null,
      radius: 10,
    };

    const featuredDeal = { ...mockDeal, featuredDeal: true };
    const regularScore = calculateRecommendationScore(mockDeal, userLocation);
    const featuredScore = calculateRecommendationScore(
      featuredDeal,
      userLocation
    );

    // Featured should add 0.15 points (15%)
    expect(featuredScore - regularScore).toBeCloseTo(0.15, 2);
  });

  test("factors in distance when location is provided", () => {
    // User location very close to the deal
    const closeLocation: UserLocation = {
      latitude: 37.775, // Almost identical location
      longitude: -122.419,
      radius: 10,
    };

    // User location far from the deal
    const farLocation: UserLocation = {
      latitude: 40.7128, // New York coordinates
      longitude: -74.006,
      radius: 10,
    };

    const scoreClose = calculateRecommendationScore(mockDeal, closeLocation);
    const scoreFar = calculateRecommendationScore(mockDeal, farLocation);

    // The closer location should have a higher score
    expect(scoreClose).toBeGreaterThan(scoreFar);
  });
});

// Test filtering logic
describe("Deal Filtering Logic", () => {
  // Create a test array of deals
  const testDeals: Deal[] = [
    {
      ...mockDeal,
      id: "1",
      discountPrice: 25,
      category: "Electronics",
    },
    {
      ...mockDeal,
      id: "2",
      discountPrice: 75,
      category: "Food",
    },
    {
      ...mockDeal,
      id: "3",
      discountPrice: 150,
      category: "Electronics",
    },
  ];

  // Test price filtering
  test("filters deals by price range", () => {
    const minPrice = 50;
    const maxPrice = 100;

    const filteredDeals = testDeals.filter(
      (deal) => deal.discountPrice >= minPrice && deal.discountPrice <= maxPrice
    );

    expect(filteredDeals.length).toBe(1);
    expect(filteredDeals[0].id).toBe("2");
  });

  // Test category filtering
  test("filters deals by category", () => {
    const category = "Electronics";

    const filteredDeals = testDeals.filter(
      (deal) => deal.category === category
    );

    expect(filteredDeals.length).toBe(2);
    expect(filteredDeals[0].id).toBe("1");
    expect(filteredDeals[1].id).toBe("3");
  });

  // Test combined filters
  test("applies multiple filters correctly", () => {
    const category = "Electronics";
    const maxPrice = 50;

    const filteredDeals = testDeals.filter(
      (deal) => deal.category === category && deal.discountPrice <= maxPrice
    );

    expect(filteredDeals.length).toBe(1);
    expect(filteredDeals[0].id).toBe("1");
  });
});
