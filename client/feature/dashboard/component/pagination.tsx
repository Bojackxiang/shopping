import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  pagination,
  onPageChange,
}: PaginationProps) {
  const { currentPage, totalPages, totalOrders, hasNextPage, hasPreviousPage } =
    pagination;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      // Show all pages if total is 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis-start");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis-end");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-between py-8 px-2">
      {/* Left side - Results info */}
      <div className="hidden sm:block">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">
            {(currentPage - 1) * pagination.pageSize + 1}
          </span>{" "}
          to{" "}
          <span className="font-medium text-foreground">
            {Math.min(currentPage * pagination.pageSize, totalOrders)}
          </span>{" "}
          of <span className="font-medium text-foreground">{totalOrders}</span>{" "}
          orders
        </p>
      </div>

      {/* Center - Page numbers */}
      <div className="flex items-center gap-1">
        {/* Previous button */}
        <Button
          variant="ghost"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPreviousPage}
          className="h-9 w-9 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/10 hover:text-accent transition-all"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (typeof page === "string") {
              return (
                <div
                  key={`${page}-${index}`}
                  className="h-9 w-9 flex items-center justify-center text-muted-foreground"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              );
            }

            const isActive = page === currentPage;

            return (
              <Button
                key={page}
                variant={isActive ? "default" : "ghost"}
                onClick={() => onPageChange(page)}
                className={`h-9 w-9 rounded-lg transition-all ${
                  isActive
                    ? "bg-accent text-accent-foreground shadow-sm font-medium"
                    : "hover:bg-accent/10 hover:text-accent"
                }`}
                aria-label={`Page ${page}`}
                aria-current={isActive ? "page" : undefined}
              >
                {page}
              </Button>
            );
          })}
        </div>

        {/* Next button */}
        <Button
          variant="ghost"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className="h-9 w-9 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/10 hover:text-accent transition-all"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Right side - Mobile results info */}
      <div className="sm:hidden">
        <p className="text-xs text-muted-foreground">
          Page {currentPage} of {totalPages}
        </p>
      </div>
    </div>
  );
}
