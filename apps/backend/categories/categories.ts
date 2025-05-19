import { api } from "encore.dev/api";
import {
  CategoriesResponse,
  Category,
  Deal,
  sampleDeals,
  CategoryMapping,
  SubcategoryItem,
} from "@repo/db-mock";

/**
 * Extracts unique categories and subcategories from deals data
 */
function extractCategories(deals: Deal[] = sampleDeals): Category[] {
  const categoryMap = deals.reduce(
    (map, { category, subcategory }) => {
      if (!map[category]) {
        map[category] = {
          name: category,
          subcategories: new Set<SubcategoryItem>(),
        };
      }

      if (subcategory) {
        map[category].subcategories.add({
          name: subcategory,
        });
      }

      return map;
    },
    {} as Record<string, CategoryMapping>
  );

  // Transform to Category[] and sort
  return Object.entries(categoryMap)
    .map(([name, data]) => ({
      category: {
        name,
      },
      subcategories: Array.from(data.subcategories)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((sub) => ({
          name: sub.name,
        })),
    }))
    .sort((a, b) => a.category.name.localeCompare(b.category.name));
}

/**
 * API endpoint that returns all unique categories and their subcategories
 */
export const getCategories = api(
  {
    method: "GET",
    path: "/categories",
    expose: true,
  },
  async (): Promise<CategoriesResponse> => {
    try {
      const categories = extractCategories();
      console.log(`Retrieved ${categories.length} categories`);
      return { categories };
    } catch (error) {
      console.error("Error retrieving categories:", error);
      throw new Error(
        `Failed to get categories: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
);
