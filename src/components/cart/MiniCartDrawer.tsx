"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { ImageIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { selectCartItemCount, selectCartItems, selectCartSubtotal } from "@/store/selector/cartSelectors";
import { removeItem, updateQuantity } from "@/store/slice/cartSlice";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Divider from "@/components/ui/Divider";
import Badge from "@/components/ui/Badge";
import Button from "../ui/Button";

type MiniCartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function MiniCartDrawer({ isOpen, onClose }: MiniCartDrawerProps) {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const count = useAppSelector(selectCartItemCount);

  // Lock scroll khi mở cart
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 w-full sm:w-[400px] h-full bg-white z-50 flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Heading level={3} className="text-lg font-semibold">
                Giỏ hàng{" "}
                <Badge variant="default" className="ml-1">
                  {count}
                </Badge>
              </Heading>
              <Button variant="ghost" size="sm" onClick={onClose} aria-label="Đóng giỏ hàng">
                <X size={20} />
              </Button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                  <div className="mb-4 p-4 rounded-full bg-[var(--color-bg-muted)]">
                    <ShoppingCart className="w-12 h-12 text-[var(--color-brand-300)]" />
                  </div>
                  <Heading level={4}>Giỏ hàng trống</Heading>
                  <Text muted>Hãy thêm sản phẩm vào giỏ để bắt đầu mua sắm nhé.</Text>
                  <Link href="/san-pham" onClick={onClose} className="w-full sm:w-auto">
                    <Button fullWidth>Tiếp tục mua sắm</Button>
                  </Link>
                </div>
              ) : (
                items.map((it) => (
                  <div
                    key={`${it.productId}-${it.variantId ?? ""}-${it.sku ?? ""}`}
                    className="flex gap-3 border-b border-gray-100 pb-3 last:border-none">
                    <div className="flex-shrink-0">
                      {it.image ? (
                        <Image src={it.image} alt={it.name} width={80} height={80} className="rounded object-cover" />
                      ) : (
                        <div className="flex items-center justify-center w-[80px] h-[80px] bg-[var(--color-bg-muted)] rounded">
                          <ImageIcon className="w-6 h-6 text-[var(--color-text-muted)]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <Text className="font-medium text-sm line-clamp-2">{it.name}</Text>
                        {it.sku && (
                          <Text muted className="text-xs mt-0.5">
                            SKU: {it.sku}
                          </Text>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center mt-2 gap-2">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() =>
                            dispatch(
                              updateQuantity({
                                productId: it.productId,
                                variantId: it.variantId ?? null,
                                sku: it.sku ?? null,
                                quantity: Math.max(it.quantity - 1, 1),
                              })
                            )
                          }>
                          −
                        </Button>
                        <Text className="min-w-[20px] text-center">{it.quantity}</Text>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() =>
                            dispatch(
                              updateQuantity({
                                productId: it.productId,
                                variantId: it.variantId ?? null,
                                sku: it.sku ?? null,
                                quantity: it.quantity + 1,
                              })
                            )
                          }>
                          +
                        </Button>

                        <Button
                          variant="ghost"
                          size="xs"
                          className="ml-2 text-red-500"
                          onClick={() =>
                            dispatch(
                              removeItem({
                                productId: it.productId,
                                variantId: it.variantId ?? null,
                                sku: it.sku ?? null,
                              })
                            )
                          }>
                          Xóa
                        </Button>
                      </div>

                      <Text className="text-sm font-semibold mt-1">
                        {(it.price * it.quantity).toLocaleString("vi-VN")}₫
                      </Text>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex justify-between mb-3">
                  <Text muted>Tạm tính:</Text>
                  <Text className="font-semibold text-lg">{subtotal.toLocaleString("vi-VN")}₫</Text>
                </div>
                <Divider className="mb-3" />
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link href="/gio-hang" onClick={onClose} className="flex-1">
                    <Button variant="outline" fullWidth>
                      Xem giỏ hàng
                    </Button>
                  </Link>
                  <Link href="/checkout" onClick={onClose} className="flex-1">
                    <Button variant="primary" fullWidth>
                      Thanh toán
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
