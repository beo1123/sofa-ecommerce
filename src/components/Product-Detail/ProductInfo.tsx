/* eslint-disable no-unused-vars */
"use client";

import { useState, useMemo } from "react";
import { ShoppingCart, Heart, Share2, Star } from "lucide-react";
import Button from "@/components/ui/Button";
import { formatCurrency } from "@/lib/products/helpers";
import { useAppDispatch } from "@/store/hook";
import { addItem } from "@/store/slice/cartSlice";

type ProductInfoProps = {
  product: any;
  selectedVariant: any;
  onVariantChange: (variant: any) => void;
  onAddToCart?: () => void;
};

export function ProductInfo({ product, selectedVariant, onVariantChange, onAddToCart }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const dispatch = useAppDispatch();
  // Extract unique attributes
  const attributes = useMemo(() => {
    if (!product.variants) return {};

    const attrs: any = {};
    product.variants.forEach((v: any) => {
      Object.keys(v.attributes || {}).forEach((key) => {
        if (!attrs[key]) attrs[key] = new Set();
        attrs[key].add(v.attributes[key]);
      });
    });

    Object.keys(attrs).forEach((key) => {
      attrs[key] = Array.from(attrs[key]);
    });

    return attrs;
  }, [product.variants]);

  const [selectedAttributes, setSelectedAttributes] = useState<any>(selectedVariant?.attributes || {});

  // Handle attribute selection
  const handleAttributeSelect = (attrKey: string, value: string) => {
    const newAttrs = { ...selectedAttributes, [attrKey]: value };
    setSelectedAttributes(newAttrs);

    // Find matching variant
    const matchingVariant = product.variants.find((v: any) => {
      return Object.keys(newAttrs).every((key) => v.attributes[key] === newAttrs[key]);
    });

    if (matchingVariant) {
      onVariantChange(matchingVariant);
    }
  };

  const availableQty = selectedVariant?.inventory?.[0]?.available || 0;

  return (
    <div className="p-6 lg:p-8 flex flex-col justify-between">
      <div>
        {/* Title */}
        <h1 className="text-3xl lg:text-4xl font-bold text-[var(--color-text-default)] mb-3">{product.title}</h1>

        {/* Short Description */}
        {product.shortDescription && (
          <p className="text-[var(--color-text-muted)] mb-4 text-lg">{product.shortDescription}</p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-1">
            <Star size={18} fill="#FCD34D" stroke="#FCD34D" />
            <span className="font-semibold">{product.reviewsSummary?.average?.toFixed(1) || "0.0"}</span>
          </div>
          <span className="text-[var(--color-text-muted)] text-sm">
            ({product.reviewsSummary?.count || 0} đánh giá)
          </span>
        </div>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-[var(--color-brand-400)]">
              {selectedVariant ? formatCurrency(Number(selectedVariant.price)) : "Liên hệ"}
            </span>
            {selectedVariant?.compareAtPrice && (
              <span className="text-xl text-[var(--color-text-muted)] line-through">
                {formatCurrency(Number(selectedVariant.compareAtPrice))}
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            SKU: {selectedVariant?.inventory?.[0]?.sku || "N/A"}
          </p>
        </div>

        {/* Variant Selectors */}
        {/* Variant Selectors */}
        <div className="space-y-5 mb-6">
          {Object.keys(attributes).map((attrKey) => (
            <div key={attrKey}>
              <label className="block text-sm font-semibold text-[var(--color-text-default)] mb-2 capitalize">
                {attrKey === "size"
                  ? "Kích thước"
                  : attrKey === "color"
                    ? "Màu sắc"
                    : attrKey === "material"
                      ? "Chất liệu"
                      : attrKey}
              </label>
              <div className="flex flex-wrap gap-2">
                {attributes[attrKey].map((value: string) => {
                  const isSelected = selectedAttributes[attrKey] === value;
                  return (
                    <Button
                      key={value}
                      variant={isSelected ? "primary" : "outline"}
                      onClick={() => handleAttributeSelect(attrKey, value)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all font-medium capitalize ${
                        isSelected
                          ? "border-[var(--color-brand-400)] bg-[var(--color-brand-400)] text-white hover:bg-[var(--color-brand-300)]"
                          : "border-gray-300 hover:border-[var(--color-brand-400)] text-[var(--color-text-default)]"
                      }`}>
                      {value}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ✅ Quantity Selector (custom, no input number) */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[var(--color-text-default)] mb-2">Số lượng</label>
          <div className="flex items-center gap-4">
            <div className="flex items-center  select-none">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                disabled={quantity <= 1}
                className="rounded-none border-none !px-4 !focus:ring-0 !focus:ring-offset-0 hover:bg-[var(--color-brand-50)]">
                −
              </Button>

              {/* Hiển thị giá trị số lượng */}
              <span className="w-16 text-center py-2 font-medium text-[var(--color-text-default)]">{quantity}</span>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity((prev) => Math.min(availableQty, prev + 1))}
                disabled={quantity >= availableQty}
                className="rounded-none border-none !px-4 !focus:ring-0 !focus:ring-offset-0 hover:bg-[var(--color-brand-50)]">
                +
              </Button>
            </div>

            <span className="text-sm text-[var(--color-text-muted)]">
              {availableQty > 0 ? `${availableQty} sản phẩm có sẵn` : "Hết hàng"}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          fullWidth
          onClick={() => {
            if (!selectedVariant) return;
            dispatch(
              addItem({
                productId: product.id,
                variantId: selectedVariant.id ?? null,
                sku: selectedVariant.inventory?.[0]?.sku ?? null,
                name: product.title,
                price: Number(selectedVariant.price),
                image: product.images?.[0]?.url ?? null,
                quantity,
              })
            );
            onAddToCart?.(); // 👈 mở MiniCart
          }}
          leftIcon={<ShoppingCart size={20} />}
          className="bg-[var(--color-brand-400)] hover:bg-[var(--color-brand-300)] text-white py-4 text-lg font-semibold rounded-xl"
          disabled={availableQty === 0}>
          Thêm vào giỏ hàng
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" leftIcon={<Heart size={18} />} className="py-3 rounded-xl">
            Yêu thích
          </Button>
          <Button variant="outline" leftIcon={<Share2 size={18} />} className="py-3 rounded-xl">
            Chia sẻ
          </Button>
        </div>
      </div>
    </div>
  );
}
