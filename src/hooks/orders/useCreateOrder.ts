"use client";

import { useState } from "react";
import axiosClient from "@/server/axiosClient";
import { CheckoutFormData } from "@/components/checkout/CheckoutForm";
import { useAppSelector, useAppDispatch } from "@/store/hook";
import { selectCartItems, selectCartSubtotal } from "@/store/selector/cartSelectors";
import { clearCart } from "@/store/slice/cartSlice";

type CreateOrderResult = {
  success: boolean;
  orderId?: number;
  orderNumber?: string;
  message?: string;
};

export function useCreateOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cartItems = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const user = useAppSelector((s) => s.user);
  const addresses = useAppSelector((s) => s.user?.addresses || []);
  const dispatch = useAppDispatch();

  async function createOrder(form: CheckoutFormData): Promise<CreateOrderResult> {
    setLoading(true);
    setError(null);

    try {
      const validItems = cartItems.filter((i) => !!i.sku);
      if (!validItems.length) {
        return { success: false, message: "Không có sản phẩm hợp lệ để đặt hàng." };
      }

      const shippingCost = form.shippingOption === "express" ? 50000 : 0;

      // ✅ Lấy địa chỉ đang chọn
      const selectedAddress = !form.useNewAddress
        ? addresses.find((a: any) => String(a.id) === String(form.addressId))
        : null;

      // ✅ Map snapshot address đúng với model Order
      const line1 = form.useNewAddress ? form.newAddress?.line1 : selectedAddress?.line1;
      const city = form.useNewAddress ? form.newAddress?.city : (selectedAddress?.city ?? "TPHCM");
      const province = form.useNewAddress ? form.newAddress?.province : selectedAddress?.province;
      const country = form.useNewAddress ? form.newAddress?.country : (selectedAddress?.country ?? "Việt Nam");

      if (!line1 || !province) {
        return { success: false, message: "Vui lòng nhập đủ địa chỉ (đường và tỉnh/quận)." };
      }

      const payload = {
        userId: user?.id,
        paymentMethod: "COD" as const,
        shipping: {
          addressId: form.useNewAddress ? undefined : Number(form.addressId), // optional
          shippingCost,
          tax: 0,
          line1,
          city,
          province,
          country,
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
        // couponId: ... (nếu có)
      };

      const res = await axiosClient.post("/orders", payload);

      const order = res.data?.order || res.data?.data || {};
      const orderId = order.id || res.data?.orderId || null;
      const orderNumber = order.orderNumber || order.number || res.data?.orderNumber || null;

      // ✅ Clear cart sau khi tạo order thành công
      if (orderId) {
        dispatch(clearCart());
      }

      return { success: true, orderId: orderId ?? undefined, orderNumber: orderNumber ?? undefined };
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
