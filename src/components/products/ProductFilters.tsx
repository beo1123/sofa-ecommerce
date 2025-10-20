"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";
import Divider from "@/components/ui/Divider";
import { Filter } from "lucide-react";

type Filters = {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  color?: string;
};

export default function ProductFilters({ currentFilters }: { currentFilters: Filters }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [category, setCategory] = useState(currentFilters.category ?? "");
  const [priceMin, setPriceMin] = useState(currentFilters.priceMin ?? "");
  const [priceMax, setPriceMax] = useState(currentFilters.priceMax ?? "");
  const [color, setColor] = useState(currentFilters.color ?? "");

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    category ? params.set("category", category) : params.delete("category");
    priceMin ? params.set("priceMin", String(priceMin)) : params.delete("priceMin");
    priceMax ? params.set("priceMax", String(priceMax)) : params.delete("priceMax");
    color ? params.set("color", color) : params.delete("color");
    params.set("page", "1");
    router.push(`/san-pham?${params.toString()}`);
  };

  const handleReset = () => {
    router.push("/san-pham");
  };

  return (
    <div className="bg-[var(--color-bg-muted)] rounded-2xl border border-[var(--color-brand-50)] p-5 space-y-6 sticky top-20">
      <Heading level={3} className="text-lg font-semibold text-[var(--color-brand-400)] flex items-center gap-2">
        <Filter size={18} /> Bộ lọc
      </Heading>

      <Divider />

      <div className="space-y-4">
        <Input
          label="Danh mục"
          placeholder="VD: Sofa góc"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Giá từ" type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} />
          <Input label="Giá đến" type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} />
        </div>

        <Input label="Màu sắc" placeholder="VD: Xám, Nâu..." value={color} onChange={(e) => setColor(e.target.value)} />
      </div>

      <Divider />

      <div className="flex gap-3">
        <Button className="flex-1" onClick={handleApply}>
          Áp dụng
        </Button>
        <Button variant="outline" className="flex-1" onClick={handleReset}>
          Đặt lại
        </Button>
      </div>
    </div>
  );
}
