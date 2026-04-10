import api from "./api";

export interface ApiProduct {
  id: number;
  sku: string;
  name: string;
  description: string;
  category: string;
  price: string;
  images: string[];
  colors: string[];
  sizes: string[];
}

export interface ApiProductDetail extends ApiProduct {
  variant_images: Record<string, string[]>;
  videos: string[];
}

export const productService = {
  async getProducts(): Promise<ApiProduct[]> {
    const { data } = await api.get<{ success: boolean; products: ApiProduct[] }>("/products");
    return data.products;
  },

  async getProductById(id: number): Promise<ApiProductDetail> {
    const { data } = await api.get<{ success: boolean; product: ApiProductDetail }>(`/products/${id}`);
    return data.product;
  },

  async getProductsByCategory(category: string): Promise<ApiProduct[]> {
    const { data } = await api.get<{ success: boolean; products: ApiProduct[] }>(
      `/products/category/${encodeURIComponent(category)}`
    );
    return data.products;
  },

  async searchProducts(query: string): Promise<ApiProduct[]> {
    const { data } = await api.get<{ success: boolean; products: ApiProduct[] }>(
      `/products/search?q=${encodeURIComponent(query)}`
    );
    return data.products;
  },
};
