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

export interface ApiVariant {
  id: number;
  size: string | null;
  color: string | null;
  sku_variant: string;
}

export interface ApiProductDetail extends ApiProduct {
  variants: ApiVariant[];
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

  async getAllAdmin(): Promise<ApiProduct[]> {
    const { data } = await api.get("/products/admin/all");
    const raw = data.products ?? data;
    return raw.map((p: any) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      description: p.description || "",
      category: p.category,
      price: p.reference_price ?? p.price ?? "0",
      images: p.image_url ? [p.image_url] : (p.images ?? []),
      colors: p.colors ?? [],
      sizes: p.sizes ?? [],
    }));
  },

  async searchProducts(query: string): Promise<ApiProduct[]> {
    const { data } = await api.get<{ success: boolean; products: ApiProduct[] }>(
      `/products/search?q=${encodeURIComponent(query)}`
    );
    return data.products;
  },
};
