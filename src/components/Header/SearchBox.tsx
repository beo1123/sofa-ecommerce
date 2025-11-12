"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Search, X } from "lucide-react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { useSearch } from "@/hooks/products/useSearch";
import { formatCurrency } from "@/lib/helpers";
import { SafeImage } from "../ui/SafeImage";

export default function SearchBox({ className = "" }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { data, isFetching, isLoading } = useSearch(query, {
    enabled: query.length > 1,
  });

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".search-box")) setOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // Clear search
  const handleClear = () => {
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  };

  // Submit (enter hoặc bấm nút)
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setOpen(false);
    router.push(`/tim-kiem?q=${encodeURIComponent(query.trim())}`);
  };

  const showDropdown = open && query.trim().length > 0;

  return (
    // ✅ chỉ thêm className="relative search-box" vào đây
    <div className={`relative search-box ${className}`}>
      {/* FORM */}
      <form onSubmit={handleSubmit}>
        <Input
          ref={inputRef}
          placeholder="Tìm kiếm sản phẩm..."
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          leftIcon={<Search size={16} />}
          rightIcon={
            isFetching ? (
              <Spinner size={16} />
            ) : query ? (
              <X size={16} className="cursor-pointer hover:text-red-500 transition" onClick={handleClear} />
            ) : undefined
          }
        />
      </form>

      {/* DROPDOWN */}
      {showDropdown && (
        <Card variant="elevated" className="absolute top-full left-0 mt-2 w-full rounded-xl shadow-xl z-50">
          {isLoading || isFetching ? (
            <div className="p-4 text-center text-sm text-gray-400">Đang tải...</div>
          ) : data?.items?.length ? (
            <ul className="max-h-64 overflow-y-auto divide-y divide-gray-100">
              {data.items.slice(0, 6).map((product: any) => (
                <li key={product.id}>
                  <Link
                    href={`/san-pham/${product.slug}`}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 transition"
                    onClick={() => setOpen(false)}>
                    {product.primaryImage?.url ? (
                      <SafeImage
                        src={product.primaryImage.url}
                        alt={product.primaryImage.alt}
                        width={40}
                        height={40}
                        className="rounded-md object-cover"
                      />
                    ) : (
                      <div className="p-3 rounded-full bg-white/60 mb-2">
                        <ImageIcon className="w-8 h-8 text-[var(--color-text-muted)]" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-800 line-clamp-1">{product.title}</span>
                      <span className="text-xs text-gray-500">{formatCurrency(product.priceMin)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-gray-400">Không tìm thấy sản phẩm</div>
          )}

          {/* Footer: View All */}
          {query.trim() && (
            <div className="border-t p-2 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSubmit}
                className="text-xs text-gray-600 hover:text-primary">
                Xem tất cả kết quả cho “{query}”
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
