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
          placeholder="Tìm kiếm sofa, chất liệu, danh mục..."
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          className="rounded-full bg-[var(--color-bg-muted)] border-[var(--color-brand-50)] focus:bg-[var(--color-bg-page)]"
          leftIcon={<Search size={16} />}
          rightIcon={
            isFetching ? (
              <Spinner size={16} />
            ) : query ? (
              <X
                size={16}
                className="cursor-pointer hover:text-[var(--color-brand-400)] transition"
                onClick={handleClear}
              />
            ) : undefined
          }
        />
      </form>

      {/* DROPDOWN */}
      {showDropdown && (
        <Card
          variant="elevated"
          padding="none"
          className="absolute top-full left-0 mt-2 w-full rounded-2xl border border-[var(--color-brand-50)] bg-[var(--color-bg-page)] shadow-[0_20px_50px_-15px_color-mix(in_srgb,var(--color-brand-400)_20%,transparent)] z-50 overflow-hidden">
          {isLoading || isFetching ? (
            <div className="p-5 text-center text-sm text-[var(--color-text-muted)]">Đang tìm kiếm...</div>
          ) : data?.items?.length ? (
            <ul className="max-h-72 overflow-y-auto divide-y divide-[var(--color-brand-50)]">
              {data.items.slice(0, 6).map((product: any) => (
                <li key={product.id}>
                  <Link
                    href={`/san-pham/${product.slug}`}
                    className="flex items-center gap-3.5 p-3.5 hover:bg-[var(--color-bg-muted)] transition-colors"
                    onClick={() => setOpen(false)}>
                    {product.primaryImage?.url ? (
                      <SafeImage
                        src={product.primaryImage.url}
                        alt={product.primaryImage.alt || product.title}
                        width={44}
                        height={44}
                        className="h-11 w-11 rounded-xl object-cover ring-1 ring-[var(--color-brand-50)]"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-bg-muted)] ring-1 ring-[var(--color-brand-50)]">
                        <ImageIcon className="w-5 h-5 text-[var(--color-text-muted)]" />
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-[var(--color-text-default)] line-clamp-1">
                        {product.title}
                      </span>
                      <span className="text-xs font-medium text-[var(--color-brand-400)]">
                        {formatCurrency(product.priceMin)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-5 text-center text-sm text-[var(--color-text-muted)]">
              Không tìm thấy sản phẩm phù hợp
            </div>
          )}

          {/* Footer: View All */}
          {query.trim() && (
            <div className="border-t border-[var(--color-brand-50)] bg-[var(--color-bg-muted)] p-2.5 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSubmit}
                className="text-xs font-semibold text-[var(--color-brand-400)] hover:text-[var(--color-brand-300)]">
                Xem tất cả kết quả cho “{query}”
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
