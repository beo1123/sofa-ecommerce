import cartReducer, { addItem, removeItem, updateQuantity, clearCart, replaceCart } from "../cartSlice";

const item = {
  productId: 1,
  sku: "SOFA-001",
  name: "Sofa Luxury",
  price: 1_000_000,
  quantity: 1,
};

describe("cartSlice", () => {
  it("should return initial state", () => {
    const state = cartReducer(undefined, { type: "unknown" } as any);
    expect(state.items).toEqual([]);
  });

  it("addItem adds new item", () => {
    const state = cartReducer(undefined, addItem(item));
    expect(state.items.length).toBe(1);
  });

  it("addItem increases quantity if item exists", () => {
    let state = cartReducer(undefined, addItem(item));
    state = cartReducer(state, addItem({ ...item, quantity: 2 }));
    expect(state.items[0].quantity).toBe(3);
  });

  it("updateQuantity modifies quantity", () => {
    let state = cartReducer(undefined, addItem(item));
    state = cartReducer(state, updateQuantity({ productId: 1, sku: "SOFA-001", quantity: 5 }));
    expect(state.items[0].quantity).toBe(5);
  });

  it("removeItem removes item", () => {
    let state = cartReducer(undefined, addItem(item));
    state = cartReducer(state, removeItem({ productId: 1, sku: "SOFA-001" }));
    expect(state.items.length).toBe(0);
  });

  it("clearCart empties all items", () => {
    let state = cartReducer(undefined, addItem(item));
    state = cartReducer(state, clearCart());
    expect(state.items).toEqual([]);
  });

  it("replaceCart replaces all items", () => {
    const newItems = [{ ...item, productId: 2, sku: "SOFA-002" }];
    const state = cartReducer(undefined, replaceCart(newItems));
    expect(state.items[0].sku).toBe("SOFA-002");
  });
});
