import api from "./api";

export interface AdminProduct {
  id: number;
  sku: string;
  name: string;
  description: string;
  category: string;
  reference_price: string;
  active: boolean;
  colors: string[];
  sizes: string[];
  images: string[];
  videos: string[];
  variants: { id: number; sku_variant: string; color: string; size: string }[];
  imagesWithColors?: { url: string; color: string | null; display_order: number }[];
  videosWithColors?: { url: string; color: string | null }[];
  primary_image_index?: number;
}

export interface ProductPayload {
  sku: string;
  name: string;
  description?: string;
  category: string;
  reference_price: number;
  active?: boolean;
  colors: string[];
  sizes: string[];
  images: string[];
  videos: string[];
  imagesWithColors?: { url: string; color: string | null }[];
  videosWithColors?: { url: string; color: string | null }[];
  primaryImageIndex?: number;
}

export const adminProductService = {
  getAll: async (): Promise<AdminProduct[]> => {
    const { data } = await api.get("/products/admin/all");
    return data.products ?? data;
  },

  getById: async (id: number): Promise<AdminProduct> => {
    const { data } = await api.get(`/products/admin/${id}`);
    return data.product ?? data;
  },

  create: async (payload: ProductPayload): Promise<AdminProduct> => {
    const { data } = await api.post("/products/admin", payload);
    return data.product ?? data;
  },

  update: async (id: number, payload: ProductPayload): Promise<AdminProduct> => {
    const { data } = await api.put(`/products/admin/${id}`, payload);
    return data.product ?? data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/admin/${id}`);
  },
};
