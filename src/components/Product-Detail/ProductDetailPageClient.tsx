"use client";

import { useState } from "react";

import RelatedProducts from "./RelatedProducts";
import { motion } from "framer-motion";
import { ProductImageGallery } from "./ProductImageGallery";
import { ProductInfo } from "./ProductInfo";
import { ProductDescription } from "./ProductDescription";
import MiniCartDrawer from "../cart/MiniCartDrawer";

type ProductDetailClientProps = {
  product: any;
  related: any[];
};

export default function ProductDetailPageClient({ product, related }: ProductDetailClientProps) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null);
  const [isCartOpen, setCartOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[var(--color-bg-muted)]">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <a href="/" className="hover:text-[var(--color-brand-400)]">
              Trang chủ
            </a>
            <span>/</span>
            <a href="/san-pham" className="hover:text-[var(--color-brand-400)]">
              Sản phẩm
            </a>
            <span>/</span>
            <span className="text-[var(--color-text-default)]">{product.title}</span>
          </div>
        </div>
      </div>

      {/* Main Product Section */}
      <section className="container mx-auto px-4 py-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 bg-white rounded-3xl shadow-lg overflow-hidden">
          {/* Left: Image Gallery */}
          <ProductImageGallery images={product.images} title={product.title} />

          {/* Right: Product Info */}
          <ProductInfo
            product={product}
            selectedVariant={selectedVariant}
            onVariantChange={setSelectedVariant}
            onAddToCart={() => setCartOpen(true)}
          />
        </motion.div>

        {/* Description Section */}
        <ProductDescription description={product.description} shortDescription={product.shortDescription} />

        {/* Related Products */}
        {related && related.length > 0 && <RelatedProducts items={related} />}
      </section>
      <MiniCartDrawer isOpen={isCartOpen} onClose={() => setCartOpen(false)} />
    </main>
  );
}
