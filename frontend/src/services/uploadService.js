const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

/**
 * Servicio para manejar subidas de archivos a Cloudinary
 */
const uploadService = {
  /**
   * Subir una imagen
   */
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return await response.json();
  },

  /**
   * Subir múltiples imágenes
   */
  uploadImages: async (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch(`${API_URL}/upload/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return await response.json();
  },

  /**
   * Subir un video
   */
  uploadVideo: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/upload/video`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return await response.json();
  },

  /**
   * Subir múltiples videos
   */
  uploadVideos: async (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch(`${API_URL}/upload/videos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return await response.json();
  },

  /**
   * Eliminar un archivo de Cloudinary
   */
  deleteFile: async (publicId, resourceType = 'image') => {
    const response = await fetch(`${API_URL}/upload/file`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ public_id: publicId, resource_type: resourceType })
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return await response.json();
  }
};

export default uploadService;
