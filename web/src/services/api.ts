import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://api.corporacionargon.com/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // envía/recibe la cookie httpOnly de sesión (el JWT ya no vive en JS)
});

// On 401 → clear local user state and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("user");
      // Evitar loop de redirect si el 401 ocurre en la propia pantalla de login
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
