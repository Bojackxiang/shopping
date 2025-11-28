"use client";

import { useState, useMemo } from "react";

import { Pagination } from "@/feature/product-list/components/pagination";
import { useProductListWithCategory } from "../hooks/use-product-list";
import { usePaginationData } from "../hooks/use-pagination-data";
import ResultsHeader from "../components/results-header";
import PageHeader from "../components/page-header";
import ProductDisplay from "../components/product-display";

// Sample product data using the available images
const products = [
  {
    id: 1,
    name: "Classic White Pearl Beaded Bracelet",
    price: "$89.99",
    originalPrice: "$120.00",
    image: "/classic-white-pearl-beaded-bracelet.jpg",
    category: "pearls",
    featured: true,
    sale: true,
  },
  {
    id: 2,
    name: "Amethyst Crystal Beaded Bracelet",
    price: "$75.99",
    image: "/amethyst-crystal-beaded-bracelet.jpg",
    category: "crystals",
    featured: false,
    sale: false,
  },
  {
    id: 3,
    name: "Golden Pearl Luxury Bracelet",
    price: "$149.99",
    image: "/golden-pearl-beaded-bracelet-luxury.jpg",
    category: "pearls",
    featured: true,
    sale: false,
  },
  {
    id: 4,
    name: "Aquamarine Crystal Pearl Bracelet",
    price: "$95.99",
    originalPrice: "$125.00",
    image: "/aquamarine-crystal-pearl-beaded-bracelet.jpg",
    category: "mixed",
    featured: false,
    sale: true,
  },
  {
    id: 5,
    name: "Crystal Sparkle Beaded Bracelet",
    price: "$68.99",
    image: "/crystal-sparkle-beaded-bracelet.jpg",
    category: "crystals",
    featured: false,
    sale: false,
  },
  {
    id: 6,
    name: "Mixed Crystal Pearl Bracelet",
    price: "$112.99",
    image: "/mixed-crystal-pearl-beaded-bracelet.jpg",
    category: "mixed",
    featured: true,
    sale: false,
  },
  {
    id: 7,
    name: "Moonstone Pearl Beaded Bracelet",
    price: "$85.99",
    originalPrice: "$110.00",
    image: "/moonstone-pearl-beaded-bracelet.jpg",
    category: "pearls",
    featured: false,
    sale: true,
  },
  {
    id: 8,
    name: "Rose Quartz Crystal Bracelet",
    price: "$79.99",
    image: "/rose-quartz-crystal-beaded-bracelet.jpg",
    category: "crystals",
    featured: false,
    sale: false,
  },
];

const categories = [
  { id: "all", name: "All Products", count: products.length },
  {
    id: "pearls",
    name: "Pearls",
    count: products.filter((p) => p.category === "pearls").length,
  },
  {
    id: "crystals",
    name: "Crystals",
    count: products.filter((p) => p.category === "crystals").length,
  },
  {
    id: "mixed",
    name: "Mixed Collections",
    count: products.filter((p) => p.category === "mixed").length,
  },
];

const sortOptions = [
  { id: "featured", name: "Featured" },
  { id: "price-low", name: "Price: Low to High" },
  { id: "price-high", name: "Price: High to Low" },
  { id: "name", name: "Name A-Z" },
];

export function ProductListView() {
  const {
    pageFromQuery,
    lastValidTotalPagesRef,
    handlePageChange,
    updateTotalPages,
    getPaginationState,
  } = usePaginationData();

  const categoryFromQuery = "all";

  const [selectedCategory, setSelectedCategory] = useState(categoryFromQuery);
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [showSaleOnly, setShowSaleOnly] = useState(false);

  const pageList = useProductListWithCategory({
    categoryId: categoryFromQuery
      ? categoryFromQuery
      : selectedCategory !== "all"
      ? selectedCategory
      : undefined,
    page: pageFromQuery,
  });

  const productData = pageList.products?.data?.products || [];
  console.log("productData: ", productData);

  const paginationData = pageList.products.data || {};
  const isLoading = !pageList.products.data;

  // Update total pages when pagination data changes
  if (paginationData.totalPages) {
    updateTotalPages(paginationData.totalPages);
  }

  const paginationState = getPaginationState(paginationData.totalPages);
  const { currentPage, totalPages, hasNextPage, hasPreviousPage } =
    paginationState;

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      const matchesSale = !showSaleOnly || product.sale;

      return matchesCategory && matchesSale;
    });

    // Sort products
    switch (sortBy) {
      case "price-low":
        return filtered.sort(
          (a, b) =>
            parseFloat(a.price.replace("$", "")) -
            parseFloat(b.price.replace("$", ""))
        );
      case "price-high":
        return filtered.sort(
          (a, b) =>
            parseFloat(b.price.replace("$", "")) -
            parseFloat(a.price.replace("$", ""))
        );
      case "name":
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case "featured":
      default:
        return filtered.sort(
          (a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
        );
    }
  }, [selectedCategory, sortBy, showSaleOnly]);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div
            className={`lg:w-64 space-y-6 ${
              showFilters ? "block" : "hidden lg:block"
            }`}
          >
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-medium text-foreground mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                      selectedCategory === category.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{category.name}</span>
                      <span className="text-xs opacity-70">
                        ({category.count})
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-medium text-foreground mb-4">
                Quick Filters
              </h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showSaleOnly}
                    onChange={(e) => setShowSaleOnly(e.target.checked)}
                    className="rounded border border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                  <span className="text-sm">Sale Items Only</span>
                </label>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <ResultsHeader
              filteredProductsCount={filteredAndSortedProducts.length}
              totalProductsCount={products.length}
              sortBy={sortBy}
              onSortChange={setSortBy}
              sortOptions={sortOptions}
            />

            {/* Products Display */}
            <ProductDisplay
              isLoading={isLoading}
              products={filteredAndSortedProducts}
              viewMode={viewMode}
            />

            {/* Pagination */}
            {filteredAndSortedProducts.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
