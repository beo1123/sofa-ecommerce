"use client";

import { useState } from "react";
import localforage from "localforage";
import axiosClient from "@/lib/axiosClient";
import { CheckoutFormData } from "@/components/checkout/CheckoutForm";
import { useAppSelector, useAppDispatch } from "@/store/hook";
import { selectCartItems, selectCartSubtotal } from "@/store/selector/cartSelectors";
import { clearCart } from "@/store/slice/cartSlice";

type CreateOrderResult = {
  success: boolean;
  orderId?: number;
  orderNumber?: string;
  guestToken?: string;
  message?: string;
};

export function useCreateOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cartItems = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const dispatch = useAppDispatch();

  async function createOrder(form: CheckoutFormData): Promise<CreateOrderResult> {
    setLoading(true);
    setError(null);

    try {
      // ✅ Bỏ các item không có SKU (tránh Prisma lỗi)
      const validItems = cartItems.filter((i) => !!i.sku);

      if (!validItems.length) {
        return { success: false, message: "Không có sản phẩm hợp lệ để đặt hàng." };
      }

      const shippingCost = form.shippingOption === "express" ? 50000 : 0;

      const payload = {
        paymentMethod: "COD",
        shipping: {
          addressId: form.useNewAddress ? undefined : Number(form.addressId),
          shippingCost,
          tax: 0,
        },
        cart: {
          items: validItems.map((item) => ({
            sku: item.sku!,
            quantity: item.quantity,
            price: item.price,
            productId: item.productId,
            variantId: item.variantId ?? null,
            name: item.name,
          })),
          subtotal,
        },
        recipient: {
          name: form.recipientName,
          phone: form.phone,
          email: form.email,
        },
        guestEmail: form.email,
        notes: form.notes,
      };

      // ✅ Gọi API
      const res = await axiosClient.post("/orders", payload);

      // ✅ Trích thông tin order chuẩn
      const order = res.data?.order || res.data?.data || {};
      const orderId = order.id || res.data?.orderId || null;
      const orderNumber = order.orderNumber || order.number || res.data?.orderNumber || null;
      const guestToken = res.data?.guestToken || order.guestToken || res.data?.data?.guestToken || null;

      // ✅ Lưu guest order (nếu có)
      if (guestToken && orderId) {
        await localforage.setItem(`guest_order:${orderId}`, {
          orderId,
          guestToken,
          email: form.email,
          createdAt: new Date().toISOString(),
        });
      }

      // ✅ Clear cart sau khi đặt hàng thành công
      dispatch(clearCart());

      return { success: true, orderId, orderNumber, guestToken };
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || err?.message || "Có lỗi xảy ra, thử lại sau.";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }

  return { createOrder, loading, error };
}
