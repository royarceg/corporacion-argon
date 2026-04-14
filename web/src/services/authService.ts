import api from "./api";

export interface User {
  id: number;
  user_name: string;
  name: string;
  email: string;
  role: "client_user" | "master_admin";
  client_id: number | null;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/auth/login", {
      username,
      password,
    });
    return data;
  },

  async verify(): Promise<User> {
    const { data } = await api.get<User>("/auth/verify");
    return data;
  },
};
