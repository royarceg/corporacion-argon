import api from "./api";

export interface ApiUser {
  id: number;
  user_name: string;
  name: string;
  email: string;
  role: "master_admin" | "client_user";
  active: boolean;
  client_id: number | null;
  created_at: string;
}

export const userService = {
  getAll: async (): Promise<ApiUser[]> => {
    const { data } = await api.get("/users");
    return data.users ?? data;
  },

  getById: async (id: number): Promise<ApiUser> => {
    const { data } = await api.get(`/users/${id}`);
    return data.user ?? data;
  },

  create: async (payload: {
    client_id?: number | null;
    user_name: string;
    email: string;
    password: string;
    role: string;
  }): Promise<ApiUser> => {
    const { data } = await api.post("/users", payload);
    return data.user ?? data;
  },

  update: async (id: number, payload: { name?: string; email?: string; user_name?: string }): Promise<ApiUser> => {
    const { data } = await api.put(`/users/${id}`, payload);
    return data.user ?? data;
  },

  resetPassword: async (id: number, newPassword: string): Promise<void> => {
    await api.put(`/users/${id}/reset-password`, { newPassword });
  },

  toggleStatus: async (id: number): Promise<void> => {
    await api.put(`/users/${id}/toggle-status`);
  },
};
