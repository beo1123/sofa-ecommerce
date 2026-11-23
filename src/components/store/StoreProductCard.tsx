import React from "react";
import Link from "next/link";
import { IconArmchair } from "@tabler/icons-react";
import Badge from "@/components/ui/Badge";
import { formatVnd } from "@/lib/format";
import { formatColorLabel, getSwatchDedupeKey, resolveColorSwatch } from "@/lib/color-swatch";
import type { StoreProductCardItem } from "@/components/store/types";

interface StoreProductCardProps {
  product: StoreProductCardItem;
}

export default function StoreProductCard({ product }: StoreProductCardProps) {
  return (
    <Link
      href={`/san-pham/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-[12px] border border-brand-100 bg-bg-page transition-colors duration-150 hover:border-brand-300 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-50">
      {/* Image: aspect 4/3 on bg-brand-50 */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-50">
        {product.primaryImageUrl ? (
          <img
            src={product.primaryImageUrl}
            alt={product.primaryImageAlt || product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-brand-200">
            <IconArmchair size={28} stroke={1.5} aria-hidden="true" />
            <span className="text-[11px]">Sofa Phạm Gia</span>
          </div>
        )}

        {product.workshopCode && (
          <span className="absolute left-2.5 top-2.5 inline-flex items-center rounded-[20px] bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-300">
            {product.workshopCode}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex items-center justify-between gap-2 text-[11px] text-text-muted">
          <span className="truncate">{product.categoryName ?? "Sofa xưởng"}</span>
          {product.allowCustomSize && <span className="shrink-0 text-brand-300">Đặt theo size</span>}
        </div>

        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-text-default transition-colors group-hover:text-brand-400">
          {product.title}
        </h3>

        <p className="mt-2 text-sm font-bold text-brand-400">
          {product.minPrice !== null ? `Giá từ ${formatVnd(product.minPrice)}` : "Liên hệ báo giá"}
        </p>

        {/* Material chips + real color swatches */}
        {(product.materialOptions.length > 0 || product.colorOptions.length > 0) && (
          <div className="mt-auto space-y-2 pt-3">
            {product.materialOptions.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {product.materialOptions.slice(0, 3).map((mat) => (
                  <Badge key={mat.label} variant="muted" className="text-[11px]">
                    {mat.label}
                  </Badge>
                ))}
                {product.materialOptions.length > 3 && (
                  <Badge variant="neutral" className="text-[11px]">
                    +{product.materialOptions.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {product.colorOptions.length > 0 && (
              <div className="flex items-center gap-1.5" aria-label="Màu sắc có sẵn">
                {product.colorOptions.slice(0, 5).map((swatch) => (
                  <span
                    key={getSwatchDedupeKey(swatch)}
                    title={formatColorLabel(swatch.name)}
                    style={{ backgroundColor: resolveColorSwatch(swatch.hex) }}
                    className="h-3.5 w-3.5 shrink-0 rounded-full border border-brand-200"
                  />
                ))}
                {product.colorOptions.length > 5 && (
                  <span className="text-[11px] font-medium text-text-muted">+{product.colorOptions.length - 5}</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
