"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { ShoppingCart, Heart, Share2, Star } from "lucide-react";
import Button from "@/components/ui/Button";
import { formatCurrency } from "@/lib/helpers";
import { useAppDispatch } from "@/store/hook";
import { addItem } from "@/store/slice/cartSlice";

type VariantAttributes = Record<string, string>;

interface InventoryItem {
  sku: string;
  quantity: number;
  reserved: number;
  available: number;
}

interface ProductVariant {
  id: number;
  name: string;
  price: string;
  compareAtPrice: string | null;
  attributes: VariantAttributes;
  inventory: InventoryItem[];
}

interface Product {
  id: number;
  title: string;
  shortDescription?: string;
  reviewsSummary?: any;
  images?: { url: string }[];
  variants: ProductVariant[];
}

interface ProductInfoProps {
  product: Product;
  selectedVariant: ProductVariant;
  onVariantChange: (variant: ProductVariant) => void;
  onAddToCart?: () => void;
}

export function ProductInfo({ product, selectedVariant, onVariantChange, onAddToCart }: ProductInfoProps) {
  const dispatch = useAppDispatch();
  const [quantity, setQuantity] = useState(1);

  // Build attribute list (unique values for each attribute key)
  const attributes: Record<string, string[]> = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const v of product.variants) {
      for (const key in v.attributes) {
        if (!map[key]) map[key] = [];
        if (!map[key].includes(v.attributes[key])) {
          map[key].push(v.attributes[key]);
        }
      }
    }
    return map;
  }, [product.variants]);

  // Local UI state for selected attributes (kept in sync with selectedVariant prop)
  const [selectedAttributes, setSelectedAttributes] = useState<VariantAttributes>(selectedVariant?.attributes || {});

  useEffect(() => {
    if (selectedVariant?.attributes) {
      setSelectedAttributes(selectedVariant.attributes);
    }
  }, [selectedVariant]);

  // Main selection handler: choose the best matching variant and sync full attributes
  const handleAttributeSelect = useCallback(
    (attrKey: string, value: string) => {
      // 1) updated attributes if user picks this value
      const updated: VariantAttributes = { ...selectedAttributes, [attrKey]: value };

      // 2) candidates that have attrKey === value
      const candidates = product.variants.filter((v) => v.attributes[attrKey] === value);

      if (candidates.length === 0) {
        // No variant has this value — keep UI in sync with current selectedVariant
        setSelectedAttributes(selectedVariant.attributes);
        return;
      }

      // 3) try to find exact match (variant whose all keys present in updated match)
      const exactMatch = candidates.find((v) =>
        Object.keys(updated).every((k) => updated[k] === undefined || v.attributes[k] === updated[k])
      );
      if (exactMatch) {
        setSelectedAttributes(exactMatch.attributes);
        if (exactMatch.id !== selectedVariant.id) onVariantChange(exactMatch);
        return;
      }

      // 4) score candidates by number of matching attributes with updated
      const score = (variant: ProductVariant) =>
        Object.keys(updated).reduce((s, k) => s + (variant.attributes[k] === updated[k] ? 1 : 0), 0);

      let best = candidates[0];
      let bestScore = score(best);

      for (let i = 1; i < candidates.length; i++) {
        const c = candidates[i];
        const s = score(c);
        if (s > bestScore) {
          best = c;
          bestScore = s;
        } else if (s === bestScore) {
          // tie-breaker: prefer available inventory > 0
          const bestAvailable = (best.inventory?.[0]?.available ?? 0) > 0 ? 1 : 0;
          const cAvailable = (c.inventory?.[0]?.available ?? 0) > 0 ? 1 : 0;
          if (cAvailable > bestAvailable) {
            best = c;
            bestScore = s;
          }
        }
      }

      // 5) set UI and callback
      setSelectedAttributes(best.attributes);
      if (best.id !== selectedVariant.id) {
        onVariantChange(best);
      }
    },
    [product.variants, selectedAttributes, selectedVariant, onVariantChange]
  );

  const availableQty =
    selectedVariant?.inventory?.[0]?.available !== undefined ? selectedVariant.inventory[0].available : 0;

  return (
    <div className="p-6 lg:p-8 flex flex-col justify-between">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold text-[var(--color-text-default)] mb-3">{product.title}</h1>

        {product.shortDescription && (
          <p className="text-[var(--color-text-muted)] mb-4 text-lg">{product.shortDescription}</p>
        )}

        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-1">
            <Star size={18} fill="#FCD34D" stroke="#FCD34D" />
            <span className="font-semibold">{product.reviewsSummary?.average?.toFixed(1) || "0.0"}</span>
          </div>
          <span className="text-[var(--color-text-muted)] text-sm">
            ({product.reviewsSummary?.count || 0} đánh giá)
          </span>
        </div>

        <div className="mb-6">
          <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
            <span className="font-bold text-[var(--color-brand-400)] text-2xl sm:text-4xl">
              {formatCurrency(Number(selectedVariant.price))}
            </span>

            {selectedVariant.compareAtPrice && (
              <span className="line-through text-[var(--color-text-muted)] text-base sm:text-xl">
                {formatCurrency(Number(selectedVariant.compareAtPrice))}
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            SKU: {selectedVariant.inventory?.[0]?.sku || "N/A"}
          </p>
        </div>

        <div className="space-y-5 mb-6">
          {Object.keys(attributes).map((attrKey) => (
            <div key={attrKey}>
              <label className="block text-sm font-semibold text-[var(--color-text-default)] mb-2 capitalize">
                {attrKey === "color" ? "Màu sắc" : attrKey === "material" ? "Chất liệu" : attrKey}
              </label>

              <div className="flex flex-wrap gap-3">
                {attributes[attrKey].map((value) => {
                  const isSelected = selectedAttributes[attrKey] === value;
                  const isColor = attrKey === "color";
                  const available = product.variants.some((v) => v.attributes[attrKey] === value);

                  return (
                    <Button
                      key={value}
                      onClick={() => handleAttributeSelect(attrKey, value)}
                      variant={isSelected ? "primary" : "outline"}
                      disabled={!available}
                      className={`border-2 rounded-xl p-0 overflow-hidden transition-all
                        ${isSelected ? "border-[var(--color-brand-400)]" : "border-gray-300 hover:border-[var(--color-brand-400)]"}
                        ${!available ? "opacity-40 cursor-not-allowed" : ""}
                      `}
                      style={
                        isColor
                          ? {
                              backgroundColor: value,
                              width: "36px",
                              height: "36px",
                            }
                          : undefined
                      }>
                      {!isColor && <span className="px-4 py-2 block text-[var(--color-text-default)]">{value}</span>}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-[var(--color-text-default)] mb-2">Số lượng</label>
          <div className="flex items-center gap-4">
            <div className="flex items-center select-none">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity((p) => Math.max(1, p - 1))}
                disabled={quantity <= 1}
                className="rounded-none border-none !px-4 hover:bg-[var(--color-brand-50)]">
                −
              </Button>

              <span className="w-16 text-center py-2 font-medium text-[var(--color-text-default)]">{quantity}</span>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity((p) => Math.min(availableQty, p + 1))}
                disabled={quantity >= availableQty}
                className="rounded-none border-none !px-4 hover:bg-[var(--color-brand-50)]">
                +
              </Button>
            </div>

            <span className="text-sm text-[var(--color-text-muted)]">
              {availableQty > 0 ? `${availableQty} sản phẩm có sẵn` : "Hết hàng"}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          fullWidth
          onClick={() => {
            dispatch(
              addItem({
                productId: product.id,
                variantId: selectedVariant.id,
                sku: selectedVariant.inventory?.[0]?.sku,
                name: product.title,
                price: Number(selectedVariant.price),
                image: product.images?.[0]?.url,
                quantity,
              })
            );
            onAddToCart?.();
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
