import { CartItem, CartState } from "@/types/cart/cart";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: CartState = {
  items: [],
  updatedAt: null,
};

function findIndex(items: CartItem[], payload: { productId: number; variantId?: number | null; sku?: string | null }) {
  return items.findIndex(
    (i) =>
      i.productId === payload.productId &&
      (payload.variantId == null ? i.variantId == null : i.variantId === payload.variantId) &&
      (payload.sku == null ? true : i.sku === payload.sku)
  );
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const idx = findIndex(state.items, action.payload);
      if (idx >= 0) {
        state.items[idx].quantity += action.payload.quantity;
      } else {
        state.items.push({ ...action.payload });
      }
      state.updatedAt = new Date().toISOString();
    },
    removeItem: (
      state,
      action: PayloadAction<{ productId: number; variantId?: number | null; sku?: string | null }>
    ) => {
      const idx = findIndex(state.items, action.payload);
      if (idx >= 0) state.items.splice(idx, 1);
      state.updatedAt = new Date().toISOString();
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ productId: number; variantId?: number | null; sku?: string | null; quantity: number }>
    ) => {
      const { productId, variantId, sku, quantity } = action.payload;
      const idx = findIndex(state.items, { productId, variantId, sku });
      if (idx >= 0) {
        if (quantity <= 0) state.items.splice(idx, 1);
        else state.items[idx].quantity = quantity;
        state.updatedAt = new Date().toISOString();
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.updatedAt = new Date().toISOString();
    },
    replaceCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = [...action.payload];
      state.updatedAt = new Date().toISOString();
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart, replaceCart } = cartSlice.actions;
export default cartSlice.reducer;
