import { useCallback, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface PaginationState {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const usePaginationData = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pageFromQuery = parseInt(searchParams.get("page") || "1", 10);
  const lastValidTotalPagesRef = useRef<number>(1);

  useEffect(() => {
    // This effect can be used to track pagination state changes
    // and update the ref when needed
  }, []);

  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      router.push(`?${params.toString()}`);
    },
    [searchParams, router]
  );

  const updateTotalPages = useCallback((totalPages: number) => {
    if (totalPages && totalPages > 0) {
      lastValidTotalPagesRef.current = totalPages;
    }
  }, []);

  const getPaginationState = (totalPages?: number): PaginationState => {
    const validTotalPages = totalPages || lastValidTotalPagesRef.current;

    return {
      currentPage: pageFromQuery,
      totalPages: validTotalPages,
      hasNextPage: pageFromQuery < validTotalPages,
      hasPreviousPage: pageFromQuery > 1,
    };
  };

  return {
    pageFromQuery,
    lastValidTotalPagesRef,
    handlePageChange,
    updateTotalPages,
    getPaginationState,
  };
};
