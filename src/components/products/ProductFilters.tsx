"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Dropdown from "@/components/ui/Dropdown";
import Button from "@/components/ui/Button";

type Category = { name: string; slug: string };

type FiltersData = {
  materials: string[];
  colors: string[];
  priceMin: number;
  priceMax: number;
};

type Filters = {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  material?: string;
  color?: string;
};

export default function ProductFilters({
  categories,
  filtersData,
  currentFilters,
  onClose,
}: {
  categories: Category[];
  filtersData: FiltersData;
  currentFilters: Filters;
  onClose?: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [category, setCategory] = useState(currentFilters.category ?? "");
  const [material, setMaterial] = useState(currentFilters.material ?? "");
  const [color, setColor] = useState(currentFilters.color ?? "");

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    category ? params.set("category", category) : params.delete("category");
    material ? params.set("material", material) : params.delete("material");
    color ? params.set("color", color) : params.delete("color");
    onClose?.();
    router.push(`/san-pham?${params.toString()}`);
  };

  const handleReset = () => {
    setCategory("");
    setMaterial("");
    setColor("");
    onClose?.();
    router.push("/san-pham");
  };

  return (
    <div className="p-4 space-y-5 w-full bg-white rounded-xl border md:bg-white md:rounded-xl md:border-1 border-transparent md:border-gray-200">
      <section className="space-y-2">
        <Dropdown
          label="Danh mục"
          value={category}
          fullWidth={true}
          placeholder="Tất cả"
          onChange={setCategory}
          options={categories.map((c) => ({ label: c.name, value: c.slug }))}
        />
      </section>

      <section className="space-y-2">
        <Dropdown
          label="Chất liệu"
          fullWidth={true}
          value={material}
          placeholder="Tất cả"
          onChange={setMaterial}
          options={filtersData.materials.map((m) => ({
            label: m.charAt(0).toUpperCase() + m.slice(1),
            value: m,
          }))}
        />
      </section>

      <section className="space-y-2">
        <Dropdown
          label="Chọn màu"
          placeholder="Tất cả"
          value={color}
          onChange={setColor}
          fullWidth={true}
          options={filtersData.colors.map((c) => ({
            label: c.charAt(0).toUpperCase() + c.slice(1),
            value: c,
            icon: <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: c }} />,
          }))}
        />
      </section>

      <div className="flex gap-2 pt-2 md:pt-2 fixed bottom-0 left-0 right-0 bg-white p-4 md:static md:p-0 md:bg-transparent border-t md:border-none">
        <Button className="flex-1" size="sm" onClick={handleApply}>
          Áp dụng
        </Button>
        <Button className="flex-1" size="sm" variant="outline" onClick={handleReset}>
          Đặt lại
        </Button>
      </div>
    </div>
  );
}
