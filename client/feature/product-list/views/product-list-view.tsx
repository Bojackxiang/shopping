"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { Pagination } from "@/feature/product-list/components/pagination";
import { useProductListWithCategory } from "../hooks/use-product-list";
import { usePaginationData } from "../hooks/use-pagination-data";
import ResultsHeader from "../components/results-header";
import PageHeader from "../components/page-header";
import ProductDisplay from "../components/product-display";
import SidebarFilters from "../components/sidebar-filters";
import useSidebarCategory from "../hooks/use-sidebar-catgeory";

const sortOptions = [
  { id: "featured", name: "Featured" },
  { id: "price-low", name: "Price: Low to High" },
  { id: "price-high", name: "Price: High to Low" },
  { id: "name", name: "Name A-Z" },
];

export function ProductListView() {
  // --------------------
  // Hooks
  // --------------------
  const searchParams = useSearchParams();
  const categoryFromQuery = searchParams.get("category") || "all";

  // --------------------
  // State
  // --------------------
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [showSaleOnly, setShowSaleOnly] = useState(false);

  // --------------------
  // Derived values
  // --------------------
  // sidebar category hooks
  const {
    pageFromQuery,
    handlePageChange,
    updateTotalPages,
    getPaginationState,
  } = usePaginationData();
  const {
    selectedCategory,
    handleCategoryChange,
    data: categoryList,
  } = useSidebarCategory();

  // use product hooks
  const pageList = useProductListWithCategory({
    categoryId: categoryFromQuery
      ? categoryFromQuery
      : selectedCategory !== "all"
      ? selectedCategory
      : undefined,
    page: pageFromQuery,
  });
  const products = pageList.products?.data?.products;
  const paginationData = pageList.products.data;
  const isLoading = pageList.products.isLoading;

  // --------------------
  // Handler functions
  // --------------------
  const handleViewModeChange = (mode: "grid" | "list") => setViewMode(mode);
  const handleToggleFilters = () => setShowFilters((prev) => !prev);
  const handleSortChange = (sort: string) => setSortBy(sort);
  const handleSaleOnlyChange = (saleOnly: boolean) => setShowSaleOnly(saleOnly);

  // Update total pages when pagination data changes
  if (paginationData?.totalPages) {
    updateTotalPages(paginationData.totalPages);
  }
  const paginationState = getPaginationState(paginationData?.totalPages);
  const { currentPage, totalPages, hasNextPage, hasPreviousPage } =
    paginationState;

  // --------------------
  // Memoized filtered and sorted products
  // --------------------
  // const filteredAndSortedProducts = useMemo(() => {}, [
  //   selectedCategory,
  //   sortBy,
  //   showSaleOnly,
  // ]);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onToggleFilters={handleToggleFilters}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <SidebarFilters
            showFilters={showFilters}
            // categories={categories}
            categories={categoryList || []}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            showSaleOnly={showSaleOnly}
            onSaleOnlyChange={handleSaleOnlyChange}
          />
          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <ResultsHeader
              filteredProductsCount={products?.length || 0}
              totalProductsCount={products?.length || 0}
              sortBy={sortBy}
              onSortChange={handleSortChange}
              sortOptions={sortOptions}
            />
            <ProductDisplay
              isLoading={isLoading}
              products={products || []}
              viewMode={viewMode}
            />
            {(isLoading || (products?.length || 0) > 0) && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  hasNextPage={hasNextPage}
                  hasPreviousPage={hasPreviousPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
