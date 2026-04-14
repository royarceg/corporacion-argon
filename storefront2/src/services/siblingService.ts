import api from "./api";

export interface Sibling {
  id: number;
  sku: string;
  name: string;
  image: string | null;
  color: string | null;
}

export interface SiblingGroup {
  id: number;
  name: string;
  products: { product_id: number; sku: string; name: string; image: string | null; color: string | null }[];
}

export const siblingService = {
  getForProduct: async (productId: number): Promise<Sibling[]> => {
    const { data } = await api.get(`/siblings/product/${productId}`);
    return data.siblings ?? [];
  },

  // Admin
  getGroups: async (): Promise<SiblingGroup[]> => {
    const { data } = await api.get("/siblings/groups");
    return data.groups ?? [];
  },

  createGroup: async (name: string, product_ids: number[]): Promise<void> => {
    await api.post("/siblings/groups", { name, product_ids });
  },

  updateGroup: async (id: number, name: string, product_ids: number[]): Promise<void> => {
    await api.put(`/siblings/groups/${id}`, { name, product_ids });
  },

  deleteGroup: async (id: number): Promise<void> => {
    await api.delete(`/siblings/groups/${id}`);
  },
};
