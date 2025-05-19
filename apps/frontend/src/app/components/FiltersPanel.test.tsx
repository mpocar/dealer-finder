import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Category } from "@repo/db-mock";
import { FilterOptions, FiltersPanel } from "./FiltersPanel";

describe("FiltersPanel", () => {
  const mockCategories: Category[] = [
    {
      category: {
        name: "Food & Drink",
      },
      subcategories: [
        {
          name: "Food",
        },
        {
          name: "Drink",
        },
      ],
    },
    {
      category: {
        name: "Beauty & Spas",
      },
      subcategories: [
        {
          name: "Massage",
        },
        {
          name: "Spa",
        },
      ],
    },
  ];
  const mockOnFilterChange = jest.fn();

  beforeEach(() => {
    mockOnFilterChange.mockClear();
  });

  test("renders all filter options correctly", () => {
    render(
      <FiltersPanel
        onFilterChange={mockOnFilterChange}
        categories={mockCategories}
      />
    );

    // Check if search input exists
    expect(screen.getByPlaceholderText("Search deals...")).toBeInTheDocument();

    // Check if all categories are rendered
    mockCategories.forEach((category) => {
      expect(screen.getByText(category.category.name)).toBeInTheDocument();
    });

    // Check if price range inputs exist
    expect(screen.getByPlaceholderText("Min")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Max")).toBeInTheDocument();

    // Check if sort dropdown exists with options
    const sortDropdown = screen.getByRole("combobox");
    expect(sortDropdown).toBeInTheDocument();
    expect(screen.getByText("Recommended")).toBeInTheDocument();
  });

  test("calls onFilterChange when search text changes", () => {
    render(
      <FiltersPanel
        onFilterChange={mockOnFilterChange}
        categories={mockCategories}
      />
    );

    const searchInput = screen.getByPlaceholderText("Search deals...");
    fireEvent.change(searchInput, { target: { value: "massage" } });

    expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        search: "massage",
      })
    );
  });

  test("calls onFilterChange when category is selected", () => {
    render(
      <FiltersPanel
        onFilterChange={mockOnFilterChange}
        categories={mockCategories}
      />
    );

    const categoryButton = screen.getByText("Food & Drink");
    fireEvent.click(categoryButton);

    expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        categories: ["Food & Drink"],
      })
    );
  });

  test("calls onFilterChange when price range changes", () => {
    render(
      <FiltersPanel
        onFilterChange={mockOnFilterChange}
        categories={mockCategories}
      />
    );

    const minInput = screen.getByPlaceholderText("Min");
    const maxInput = screen.getByPlaceholderText("Max");

    fireEvent.change(minInput, { target: { value: "10" } });
    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        minPrice: 10,
      })
    );

    fireEvent.change(maxInput, { target: { value: "100" } });
    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        maxPrice: 100,
      })
    );
  });

  test("calls onFilterChange when sort option changes", () => {
    render(
      <FiltersPanel
        onFilterChange={mockOnFilterChange}
        categories={mockCategories}
      />
    );

    const sortDropdown = screen.getByRole("combobox");
    fireEvent.change(sortDropdown, { target: { value: "price-low-high" } });

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        sortBy: "price-low-high",
      })
    );
  });

  test("clears all filters when clear all button is clicked", async () => {
    const { rerender } = render(
      <FiltersPanel
        onFilterChange={mockOnFilterChange}
        categories={mockCategories}
      />
    );

    // Set some filters first
    const searchInput = screen.getByPlaceholderText("Search deals...");
    fireEvent.change(searchInput, { target: { value: "massage" } });

    // Manually update props to show active filters
    mockOnFilterChange.mockClear();

    // We need to re-render with the active filters to show the clear all button
    const activeFilters: FilterOptions = {
      search: "massage",
      categories: [
        {
          category: { name: "Beauty & Spas" },
          subcategories: [{ name: "Massage" }, { name: "Spa" }],
        },
      ],
      selectedSubcategories: ["Massage", "Spa"],
      minPrice: 20,
      maxPrice: 100,
      sortBy: "recommended",
      useLocation: false,
      userLocation: null,
      radius: 10,
    };

    // Mock the useState to return our activeFilters
    const originalUseState = React.useState;
    jest
      .spyOn(React, "useState")
      .mockImplementationOnce(() => [activeFilters, jest.fn()]);

    rerender(
      <FiltersPanel
        onFilterChange={mockOnFilterChange}
        categories={mockCategories}
      />
    );

    // Now the clear all button should be visible
    const clearAllButton = screen.getByText("Clear all");
    fireEvent.click(clearAllButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        search: "",
        categories: [],
        minPrice: null,
        maxPrice: null,
      })
    );

    // Restore original useState
    React.useState = originalUseState;
  });
});
