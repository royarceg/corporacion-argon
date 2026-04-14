import api from "./api";

export interface WishlistItem {
  wishlist_id: number;
  product_id: number;
  sku: string;
  name: string;
  category: string;
  price: string;
  image_url: string | null;
  added_at: string;
}

export const wishlistService = {
  async getWishlist(): Promise<WishlistItem[]> {
    const { data } = await api.get<{ success: boolean; wishlist: WishlistItem[] }>("/wishlist");
    return data.wishlist ?? [];
  },

  async add(product_id: number): Promise<void> {
    await api.post("/wishlist", { product_id });
  },

  async remove(product_id: number): Promise<void> {
    await api.delete(`/wishlist/${product_id}`);
  },
};
