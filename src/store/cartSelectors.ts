import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/store";

export const selectCart = (state: RootState) => state.cart;

export const selectCartItems = createSelector(selectCart, (cart) => cart.items);

export const selectCartItemCount = createSelector(selectCartItems, (items) =>
  items.reduce((sum, item) => sum + item.quantity, 0)
);

export const selectCartSubtotal = createSelector(selectCartItems, (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0)
);

export const selectCartShipping = createSelector(selectCartSubtotal, (subtotal) =>
  subtotal >= 5_000_000 ? 0 : 50_000
);

export const selectCartTotal = createSelector(
  selectCartSubtotal,
  selectCartShipping,
  (subtotal, shipping) => subtotal + shipping
);
