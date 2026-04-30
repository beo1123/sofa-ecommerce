"use client";

import { useRouter } from "next/navigation";
import Button from "./Button";

type Props = {
  currentPage: number;
  totalItems?: number;
  perPage?: number;
  basePath?: string;
  currentFilters?: Record<string, any>;
  totalPages?: number;
  onPageChange?: (page: number) => void;
};

export default function Pagination({
  currentPage,
  totalItems,
  perPage,
  basePath,
  currentFilters = {},
  totalPages: totalPagesFromProps,
  onPageChange,
}: Props) {
  const router = useRouter();
  const totalPages =
    totalPagesFromProps ??
    (typeof totalItems === "number" && typeof perPage === "number" ? Math.ceil(totalItems / perPage) : 1);

  // if (totalPages <= 1) return null;

  const handleChangePage = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
      return;
    }
    if (!basePath || !perPage) return;
    const params = new URLSearchParams();
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value) params.set(key, String(value));
    });
    params.set("page", String(page));
    params.set("perPage", String(perPage));
    router.push(`${basePath}?${params.toString()}`);
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <Button variant="outline" disabled={currentPage === 1} onClick={() => handleChangePage(currentPage - 1)}>
        Trước
      </Button>

      <span className="text-sm text-muted">
        Trang {currentPage} / {totalPages}
      </span>

      <Button variant="outline" disabled={currentPage === totalPages} onClick={() => handleChangePage(currentPage + 1)}>
        Sau
      </Button>
    </div>
  );
}
