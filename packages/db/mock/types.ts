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

export type SortOption =
  | "recommended"
  | "price-low-high"
  | "price-high-low"
  | "discount-high-low"
  | "rating-high-low";

// Input validation interface
export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface SearchResponse {
  deals: Deal[];
  total: number;
  filters: FilterCriteria;
}

export interface DealsResponse {
  deals: Deal[];
  message?: string;
}

export interface CategoriesResponse {
  categories: Category[];
}

// Define request parameters interface for listDeals
export interface DealsRequestParams {
  search?: string;
  sortBy?: string;
  minPrice?: string;
  maxPrice?: string;
  categories?: string;
  subcategories?: string;
  latitude?: string;
  longitude?: string;
  radius?: string;
}

// Define a type for user location parameters
export interface UserLocation {
  latitude: number | null;
  longitude: number | null;
  radius: number;
}

// Define an interface for the intermediate category mapping
export interface CategoryMapping {
  name: string;
  subcategories: Set<SubcategoryItem>;
}

// Define subcategory item interface
export interface SubcategoryItem {
  name: string;
}

export interface UseDealsDataProps {
  filters: FilterOptions;
}

export interface UseDealsDataResult {
  deals: Deal[];
  categories: Category[];
  loading: boolean;
  loadingCategories: boolean;
  errorMessage: string | null;
}

// Extended FilterOptions to support subcategories and location
export interface FilterOptions {
  search: string;
  categories: Category[];
  selectedSubcategories: string[]; // Store selected subcategory names
  minPrice: number | null;
  maxPrice: number | null;
  sortBy: SortOption;
  // Location filtering
  useLocation: boolean;
  userLocation: { lat: number; lng: number } | null;
  radius: number;
}

export interface FiltersPanelProps {
  onFilterChange: (filters: FilterOptions) => void;
  categories: Category[];
  isLocating?: boolean;
  locationError?: string | null;
}
