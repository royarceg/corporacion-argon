import api from "./api";

export interface ApiClient {
  id: number;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  active: boolean;
}

export const clientService = {
  getAll: async (): Promise<ApiClient[]> => {
    const { data } = await api.get("/clients");
    return data.clients ?? data;
  },

  create: async (company_name: string, contact_name?: string, email?: string): Promise<ApiClient> => {
    const { data } = await api.post<{ success: boolean; client: ApiClient }>("/clients", {
      company_name,
      contact_name,
      email,
    });
    return data.client;
  },

  getClientProducts: async (clientId: number): Promise<number[]> => {
    const { data } = await api.get(`/clients/${clientId}/products`);
    return data.product_ids ?? data;
  },

  assignProduct: async (clientId: number, productId: number): Promise<void> => {
    await api.post(`/clients/${clientId}/products/${productId}`);
  },

  unassignProduct: async (clientId: number, productId: number): Promise<void> => {
    await api.delete(`/clients/${clientId}/products/${productId}`);
  },

  assignAll: async (clientId: number): Promise<void> => {
    await api.post(`/clients/${clientId}/products/assign-all`);
  },

  unassignAll: async (clientId: number): Promise<void> => {
    await api.post(`/clients/${clientId}/products/unassign-all`);
  },
};
