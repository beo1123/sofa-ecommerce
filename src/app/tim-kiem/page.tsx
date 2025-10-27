// app/search/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useSearch } from "@/hooks/products/useSearch";
import ProductCard from "@/components/products/ProductCard";
import Heading from "@/components/ui/Heading";
import Spinner from "@/components/ui/Spinner";

export default function SearchPage() {
  const params = useSearchParams();
  const query = params.get("q") || "";
  const { data, isLoading } = useSearch(query, { perPage: 12 });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Heading level={2} className="text-2xl font-semibold mb-6">
        Kết quả tìm kiếm cho: “{query}”
      </Heading>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      )}

      {!isLoading && data?.items?.length === 0 && (
        <p className="text-center text-[var(--color-text-muted)]">Không tìm thấy sản phẩm nào phù hợp.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {data?.items?.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
