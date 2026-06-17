const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.corporacionargon.com/api";

// La auth viaja en la cookie httpOnly (credentials: "include"), no en un header.
export const uploadService = {
  uploadImages: async (files: File[]): Promise<{ url: string; public_id: string }[]> => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    const res = await fetch(`${API_URL}/upload/images`, {
      method: "POST",
      credentials: "include",
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
      credentials: "include",
      body: formData,
    });
    if (!res.ok) throw await res.json();
    const data = await res.json();
    return data.videos ?? data;
  },

  deleteFile: async (publicId: string, resourceType: string = "image"): Promise<void> => {
    const res = await fetch(`${API_URL}/upload/file`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ public_id: publicId, resource_type: resourceType }),
    });
    if (!res.ok) throw await res.json();
  },
};
