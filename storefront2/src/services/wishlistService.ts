import api from "./api";
import { ApiProduct } from "./productService";

export const wishlistService = {
  async getWishlist(): Promise<ApiProduct[]> {
    const { data } = await api.get<{ success: boolean; products: ApiProduct[] }>("/wishlist");
    return data.products;
  },

  async add(product_id: number): Promise<void> {
    await api.post("/wishlist", { product_id });
  },

  async remove(product_id: number): Promise<void> {
    await api.delete(`/wishlist/${product_id}`);
  },
};
