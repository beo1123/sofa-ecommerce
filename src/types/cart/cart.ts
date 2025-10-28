export type CartItem = {
  productId: number;
  variantId?: number | null;
  sku?: string | null;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
  metadata?: Record<string, any>;
};

export type CartState = {
  items: CartItem[];
  updatedAt?: string | null;
};

export type CartItemInput = {
  productId: number;
  variantId?: number | null;
  sku?: string | null;
  quantity: number;
};
