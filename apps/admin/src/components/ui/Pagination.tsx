"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

type Props = {
  currentPage: number;
  totalItems: number;
  perPage: number;
  basePath: string;
  currentFilters?: Record<string, any>;
};

export default function Pagination({ currentPage, totalItems, perPage, basePath, currentFilters = {} }: Props) {
  const router = useRouter();
  const totalPages = Math.ceil(totalItems / perPage);

  // if (totalPages <= 1) return null;

  const handleChangePage = (page: number) => {
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
