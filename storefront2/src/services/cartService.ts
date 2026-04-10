import api from "./api";

export interface CartItem {
  id: number;
  product_id: number;
  variant_id: number | null;
  quantity: number;
  unit_price: string;
  product_name: string;
  product_sku: string;
  image_url: string | null;
  color: string | null;
  size: string | null;
  line_total: string;
}

export interface CartSummary {
  items: CartItem[];
  total: string;
  items_count: number;
}

export const cartService = {
  async getCart(): Promise<CartSummary> {
    const { data } = await api.get<CartSummary>("/cart");
    return data;
  },

  async addToCart(product_id: number, quantity: number, variant_id?: number): Promise<void> {
    await api.post("/cart", { product_id, quantity, variant_id });
  },

  async updateItem(cart_item_id: number, quantity: number): Promise<void> {
    await api.put(`/cart/${cart_item_id}`, { quantity });
  },

  async removeItem(cart_item_id: number): Promise<void> {
    await api.delete(`/cart/${cart_item_id}`);
  },

  async clearCart(): Promise<void> {
    await api.delete("/cart");
  },

  async getCount(): Promise<number> {
    const { data } = await api.get<{ items_count: number; total_quantity: number }>("/cart/count");
    return data.total_quantity;
  },
};
