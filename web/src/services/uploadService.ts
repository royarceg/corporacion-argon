const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend-production-e716.up.railway.app/api";

function authHeader(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const uploadService = {
  uploadImages: async (files: File[]): Promise<{ url: string; public_id: string }[]> => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    const res = await fetch(`${API_URL}/upload/images`, {
      method: "POST",
      headers: authHeader(),
      body: formData,
    });
    if (!res.ok) throw await res.json();
    const data = await res.json();
    return data.images ?? data;
  },

  uploadVideos: async (files: File[]): Promise<{ url: string; public_id: string }[]> => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    const res = await fetch(`${API_URL}/upload/videos`, {
      method: "POST",
      headers: authHeader(),
      body: formData,
    });
    if (!res.ok) throw await res.json();
    const data = await res.json();
    return data.videos ?? data;
  },

  deleteFile: async (publicId: string, resourceType: string = "image"): Promise<void> => {
    const res = await fetch(`${API_URL}/upload/file`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ public_id: publicId, resource_type: resourceType }),
    });
    if (!res.ok) throw await res.json();
  },
};
