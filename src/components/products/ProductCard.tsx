"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImageIcon } from "lucide-react";
import { formatCurrency } from "@/lib/helpers";
import Text from "@/components/ui/Text";
import Heading from "@/components/ui/Heading";

import { useState } from "react";
import MiniCartDrawer from "@/components/cart/MiniCartDrawer";
import { useAppDispatch } from "@/store/hook";
import { addItem } from "@/store/slice/cartSlice";
import { SafeImage } from "../ui/SafeImage";

type ProductCardProps = {
  product: {
    id?: string | number;
    slug: string;
    title: string;
    shortDescription?: string;
    priceMin: number;
    primaryImage?: { url?: string; alt?: string };
    variants?: {
      id: number;
      price: number;
      compareAtPrice?: number | null;
      image?: string | null;
      attributes?: Record<string, string>;
      inventory?: { sku: string; available?: number }[];
    }[];
  };
};

export default function ProductCard({ product }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isCartOpen, setCartOpen] = useState(false);

  const routeLink = `/san-pham/${product.slug}`;

  const getFirstAvailableVariant = () => {
    return product.variants?.find((v) => (v.inventory?.[0]?.available ?? 1) > 0) || product.variants?.[0] || null;
  };

  const addToCart = () => {
    const variant = getFirstAvailableVariant();

    dispatch(
      addItem({
        productId: Number(product.id ?? 0),
        variantId: variant?.id ?? null,
        sku: variant?.inventory?.[0]?.sku ?? null,
        name: product.title,
        price: Number(variant?.price ?? product.priceMin),
        image: variant?.image ?? product.primaryImage?.url ?? null,
        quantity: 1,
      })
    );
  };

  // ✅ Giỏ hàng bình thường
  const handleAddToCart = () => {
    addToCart();
    setCartOpen(true);
  };

  // ✅ Mua ngay → thêm vào giỏ → chuyển đến /thanh-toan
  const handleBuyNow = () => {
    addToCart();
    router.push("/gio-hang");
  };

  return (
    <>
      <div className="group relative rounded-3xl overflow-hidden bg-[var(--color-bg-page)] shadow-sm hover:shadow-xl transition-all duration-500 h-full flex flex-col">
        {/* IMAGE */}
        <Link href={routeLink} className="block relative w-full aspect-square overflow-hidden flex-shrink-0">
          {product.primaryImage?.url ? (
            <SafeImage
              src={product.primaryImage.url}
              alt={product.primaryImage.alt ?? product.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--color-bg-muted)] text-[var(--color-text-muted)]">
              <div className="p-3 rounded-full bg-white/60 mb-2">
                <ImageIcon className="w-8 h-8 text-[var(--color-text-muted)]" />
              </div>
              <span className="text-xs font-medium opacity-80">Không có hình</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 md:group-hover:opacity-100 transition-opacity duration-500" />

          {/* ✅ Floating Actions */}
          {/* <div
            className="
              absolute bottom-4 left-1/2 -translate-x-1/2
              flex flex-wrap justify-center gap-3
              opacity-100 translate-y-0
              md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0
              transition-all duration-500
              px-2 w-[90%] sm:w-auto
            ">
            <Button
              variant="secondary"
              leftIcon={<ShoppingCart size={16} />}
              onClick={(e) => {
                e.preventDefault();
                handleAddToCart();
              }}
              className="
                flex-1 sm:flex-none min-w-[100px]
                px-4 py-2 rounded-full bg-white/90 text-[var(--color-brand-400)]
                hover:bg-[var(--color-brand-400)] hover:text-white
                shadow-md text-sm font-medium transition-all
              ">
              Giỏ hàng
            </Button>

            <Button
              variant="primary"
              leftIcon={<ShoppingBag size={16} />}
              onClick={(e) => {
                e.preventDefault();
                handleBuyNow();
              }}
              className="
                flex-1 sm:flex-none min-w-[100px]
                px-4 py-2 rounded-full bg-[var(--color-brand-400)] hover:bg-[var(--color-brand-300)]
                shadow-md text-sm font-medium transition-all
              ">
              Mua ngay
            </Button>
          </div> */}
        </Link>

        {/* CONTENT */}
        <div className="p-4 text-center space-y-2 flex flex-col flex-grow justify-between">
          <div>
            <Link href={routeLink}>
              <Heading
                level={3}
                className="text-base font-semibold line-clamp-2 text-[var(--color-text-default)] group-hover:text-[var(--color-brand-400)] transition-colors">
                {product.title}
              </Heading>
            </Link>
            {product.shortDescription && (
              <Text muted className="text-xs line-clamp-2 mt-1">
                {product.shortDescription}
              </Text>
            )}
          </div>

          <Text className="text-lg font-semibold text-[var(--color-brand-400)] mt-2">
            {formatCurrency(product.priceMin)}
          </Text>
        </div>
      </div>

      {/* ✅ MiniCart Drawer */}
      <MiniCartDrawer isOpen={isCartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
