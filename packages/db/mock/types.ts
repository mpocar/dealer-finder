export interface Location {
  lat: number;
  lng: number;
  address?: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Deal {
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

export interface FilterCriteria {
  maxPrice?: number;
  minDiscount?: number;
  category?: string;
  subcategory?: string;
  tags?: string[];
  location?: Location;
  radius?: number; // in miles
  merchantRating?: number;
  sortBy?: "discount" | "price" | "rating" | "popularity" | "expiry";
  sortOrder?: "asc" | "desc";
}

export interface Category {
  category: {
    name: string;
  };
  subcategories: {
    name: string;
  }[];
}

export interface CategoriesResponse {
  categories: Category[];
}

// Valid sort options
export const VALID_SORT_OPTIONS = [
  "recommended",
  "price-low-high",
  "price-high-low",
  "discount-high-low",
  "rating-high-low",
];

// Input validation interface
export interface ValidationResult {
  isValid: boolean;
  message?: string;
}
