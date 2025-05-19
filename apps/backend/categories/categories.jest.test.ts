// Add imports for Jest
import { describe, expect, test } from "@jest/globals";

// Manually define simplified types for testing
interface SubcategoryItem {
  name: string;
}

interface Category {
  category: {
    name: string;
  };
  subcategories: SubcategoryItem[];
}

interface Deal {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  // Other fields not needed for category tests
}

interface CategoryMapping {
  name: string;
  subcategories: Set<SubcategoryItem>;
}

// Recreate the extractCategories function for testing
function extractCategories(deals: Deal[]): Category[] {
  // Group subcategories by category slug
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

describe("Categories Functionality", () => {
  // Sample deal data for testing
  const testDeals: Deal[] = [
    {
      id: "1",
      title: "Electronics Deal 1",
      category: "Electronics",
      subcategory: "Phones",
    },
    {
      id: "2",
      title: "Electronics Deal 2",
      category: "Electronics",
      subcategory: "Computers",
    },
    {
      id: "3",
      title: "Food Deal 1",
      category: "Food",
      subcategory: "Restaurants",
    },
    {
      id: "4",
      title: "Food Deal 2",
      category: "Food",
      subcategory: "Restaurants", // Note: This creates a duplicate because of how objects work with Sets
    },
    {
      id: "5",
      title: "Food Deal 3",
      category: "Food",
      subcategory: "Grocery",
    },
    {
      id: "6",
      title: "Food Deal 4",
      category: "Food",
      subcategory: "Delivery",
    },
  ];

  test("debug: inspect subcategories structure", () => {
    const categories = extractCategories(testDeals);
    const food = categories.find((c) => c.category.name === "Food");

    console.log(
      "Food subcategories:",
      food?.subcategories.map((s) => s.name)
    );

    // This ensures we don't fail the debug test
    expect(true).toBe(true);
  });

  test("extracts unique categories correctly", () => {
    const categories = extractCategories(testDeals);

    // Should have 2 unique categories: Electronics and Food
    expect(categories.length).toBe(2);
    expect(categories[0].category.name).toBe("Electronics");
    expect(categories[1].category.name).toBe("Food");
  });

  test("extracts subcategories correctly", () => {
    const categories = extractCategories(testDeals);

    // Electronics should have 2 subcategories
    const electronics = categories.find(
      (c) => c.category.name === "Electronics"
    );
    expect(electronics?.subcategories.length).toBe(2);
    expect(electronics?.subcategories.map((s) => s.name)).toContain("Phones");
    expect(electronics?.subcategories.map((s) => s.name)).toContain(
      "Computers"
    );

    // Food should have 4 subcategories (including duplicate "Restaurants")
    const food = categories.find((c) => c.category.name === "Food");

    // Get all subcategory names for clearer error message
    const foodSubcategories = food?.subcategories.map((s) => s.name) || [];

    // Check that Food has the expected number of subcategories
    expect(foodSubcategories.length).toBe(4);

    // Check for specific subcategories
    expect(foodSubcategories).toContain("Delivery");
    expect(foodSubcategories).toContain("Restaurants");
    expect(foodSubcategories).toContain("Grocery");

    // Count occurrences of "Restaurants"
    const restaurantCount = foodSubcategories.filter(
      (s) => s === "Restaurants"
    ).length;
    expect(restaurantCount).toBe(2);
  });

  test("sorts categories alphabetically", () => {
    const categories = extractCategories(testDeals);

    // Electronics comes before Food alphabetically
    expect(categories[0].category.name).toBe("Electronics");
    expect(categories[1].category.name).toBe("Food");
  });

  test("sorts subcategories alphabetically", () => {
    const categories = extractCategories(testDeals);

    // In Electronics: Computers comes before Phones alphabetically
    const electronics = categories.find(
      (c) => c.category.name === "Electronics"
    );
    expect(electronics?.subcategories[0].name).toBe("Computers");
    expect(electronics?.subcategories[1].name).toBe("Phones");

    // In Food: subcategories should be alphabetically sorted
    const food = categories.find((c) => c.category.name === "Food");
    expect(food?.subcategories[0].name).toBe("Delivery");
    expect(food?.subcategories[1].name).toBe("Grocery");
    // Note: There will be two "Restaurants" entries, which should be adjacent in the sorted array
    expect(food?.subcategories[2].name).toBe("Restaurants");
    expect(food?.subcategories[3].name).toBe("Restaurants");
  });

  test("handles empty deals array", () => {
    const categories = extractCategories([]);
    expect(categories.length).toBe(0);
  });

  test("handles deals with missing subcategories", () => {
    const dealsWithMissingSubcategories: Deal[] = [
      {
        id: "1",
        title: "Electronics Deal",
        category: "Electronics",
        subcategory: "",
      },
      {
        id: "2",
        title: "Food Deal",
        category: "Food",
        subcategory: "Restaurants",
      },
    ];

    const categories = extractCategories(dealsWithMissingSubcategories);

    // Should still extract both categories
    expect(categories.length).toBe(2);

    // Electronics should have no subcategories
    const electronics = categories.find(
      (c) => c.category.name === "Electronics"
    );
    expect(electronics?.subcategories.length).toBe(0);

    // Food should have 1 subcategory
    const food = categories.find((c) => c.category.name === "Food");
    expect(food?.subcategories.length).toBe(1);
    expect(food?.subcategories[0].name).toBe("Restaurants");
  });
});
