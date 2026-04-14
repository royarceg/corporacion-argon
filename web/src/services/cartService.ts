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
    const { data } = await api.get<{ success: boolean; cart: any }>("/cart");
    const raw = data.cart ?? data;
    return {
      items: (raw.items ?? []).map((item: any) => ({
        id: item.id ?? item.cart_item_id,
        product_id: item.product_id,
        variant_id: item.variant_id ?? null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        product_name: item.product_name ?? item.name,
        product_sku: item.product_sku ?? item.sku,
        image_url: item.image_url ?? null,
        color: item.color ?? null,
        size: item.size ?? null,
        line_total: item.line_total ?? item.subtotal ?? "0",
      })),
      total: raw.total ?? "0",
      items_count: raw.total_items ?? raw.items_count ?? 0,
    };
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
};
