"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import { ShoppingCart } from "lucide-react";

/**
 * AddToCartButton
 * – Hiển thị nút thêm vào giỏ hàng (placeholder chưa có logic thật)
 * – Khi nhấn, chỉ hiển thị animation + toast/alert đơn giản
 */
export default function AddToCartButton({ productId }: { productId: number }) {
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    try {
      setLoading(true);
      // giả lập API call
      await new Promise((r) => setTimeout(r, 800));
      alert(`🛒 Đã thêm sản phẩm #${productId} vào giỏ hàng`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="primary" loading={loading} leftIcon={<ShoppingCart size={16} />} onClick={handleAdd} fullWidth>
      Thêm vào giỏ hàng
    </Button>
  );
}
