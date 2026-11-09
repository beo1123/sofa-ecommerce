"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import RelatedProducts from "./RelatedProducts";
import { motion } from "framer-motion";
import { ProductImageGallery } from "./ProductImageGallery";
import { ProductInfo } from "./ProductInfo";
import { ProductDescription } from "./ProductDescription";
import MiniCartDrawer from "../cart/MiniCartDrawer";
import StoreHighlights from "@/components/common/StoreHighlights";

type ProductDetailClientProps = {
  product: any;
  related: any[];
};

export default function ProductDetailPageClient({ product, related }: ProductDetailClientProps) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null);
  const [isCartOpen, setCartOpen] = useState(false);

  return (
    <div className="min-h-screen py-4 sm:py-8 space-y-6 sm:space-y-8 lg:space-y-12">
      {/* Breadcrumb Bar */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl bg-[var(--color-bg-muted)] px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-[var(--color-text-muted)] ring-1 ring-[var(--color-brand-50)]">
        <Link href="/" className="font-medium hover:text-[var(--color-brand-400)] transition-colors">
          Trang chủ
        </Link>
        <ChevronRight size={14} className="text-[var(--color-brand-200)] shrink-0" />
        <Link href="/san-pham" className="font-medium hover:text-[var(--color-brand-400)] transition-colors">
          Sản phẩm
        </Link>
        {product.category?.name && product.category?.slug && (
          <>
            <ChevronRight size={14} className="text-[var(--color-brand-200)] shrink-0" />
            <Link
              href={`/san-pham?category=${encodeURIComponent(product.category.slug)}`}
              className="font-medium hover:text-[var(--color-brand-400)] transition-colors">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight size={14} className="text-[var(--color-brand-200)] shrink-0" />
        <span className="font-semibold text-[var(--color-text-default)] line-clamp-1">{product.title}</span>
      </nav>

      {/* Main Bento Product Section */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-start">
          {/* Left: Visual-First Image Gallery Bento Cell (7 cols) */}
          <div className="lg:col-span-7 overflow-hidden rounded-2xl sm:rounded-3xl bg-[var(--color-bg-page)] ring-1 ring-[var(--color-brand-50)] shadow-[0_12px_40px_-16px_color-mix(in_srgb,var(--color-brand-400)_12%,transparent)]">
            <ProductImageGallery
              images={product.images}
              title={product.title}
              shortDescription={product.shortDescription}
            />
          </div>

          {/* Right: Product Info Bento Cell (5 cols) */}
          <div className="lg:col-span-5 overflow-hidden rounded-2xl sm:rounded-3xl bg-[var(--color-bg-page)] ring-1 ring-[var(--color-brand-50)] shadow-[0_12px_40px_-16px_color-mix(in_srgb,var(--color-brand-400)_12%,transparent)]">
            <ProductInfo
              product={product}
              selectedVariant={selectedVariant}
              onVariantChange={setSelectedVariant}
              onAddToCart={() => setCartOpen(true)}
            />
          </div>
        </motion.div>

        <div className="mt-10 lg:mt-14">
          <StoreHighlights
            title="Cam kết khi mua sofa tại Phạm Gia"
            subtitle="Rõ ràng về chất lượng, linh hoạt trong thiết kế và luôn đồng hành cùng bạn trong suốt quá trình mua hàng."
          />
        </div>

        {/* Description Section */}
        <ProductDescription
          description={product.description}
          shortDescription={product.shortDescription}
          reviews={product.reviews}
        />

        {/* Related Products */}
        {related && related.length > 0 && <RelatedProducts items={related} />}
      </section>
      <MiniCartDrawer isOpen={isCartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
