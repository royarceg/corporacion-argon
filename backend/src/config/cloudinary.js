// Configuración de Cloudinary
const cloudinary = require('cloudinary').v2;

// Configurar Cloudinary con tus credenciales
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Subir una imagen a Cloudinary
 * @param {Buffer|String} file - Archivo a subir (buffer o ruta)
 * @param {Object} options - Opciones de subida
 * @returns {Promise<Object>} - Resultado con URL de la imagen
 */
const uploadImage = async (file, options = {}) => {
  try {
    const defaultOptions = {
      folder: 'products/images',
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' }, // Limitar tamaño máximo
        { quality: 'auto' }, // Optimización automática de calidad
        { fetch_format: 'auto' } // Formato automático (WebP cuando sea posible)
      ],
      ...options
    };

    const result = await cloudinary.uploader.upload(file, defaultOptions);
    
    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format
    };
  } catch (error) {
    console.error('Error al subir imagen a Cloudinary:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Subir un video a Cloudinary
 * @param {Buffer|String} file - Archivo a subir (buffer o ruta)
 * @param {Object} options - Opciones de subida
 * @returns {Promise<Object>} - Resultado con URL del video
 */
const uploadVideo = async (file, options = {}) => {
  try {
    const defaultOptions = {
      folder: 'products/videos',
      resource_type: 'video',
      transformation: [
        { width: 1920, height: 1080, crop: 'limit' },
        { quality: 'auto' }
      ],
      ...options
    };

    const result = await cloudinary.uploader.upload(file, defaultOptions);
    
    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      duration: result.duration,
      width: result.width,
      height: result.height,
      format: result.format
    };
  } catch (error) {
    console.error('Error al subir video a Cloudinary:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Eliminar un archivo de Cloudinary
 * @param {String} publicId - ID público del archivo en Cloudinary
 * @param {String} resourceType - Tipo de recurso ('image' o 'video')
 * @returns {Promise<Object>} - Resultado de la eliminación
 */
const deleteFile = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    
    return {
      success: result.result === 'ok',
      result: result.result
    };
  } catch (error) {
    console.error('Error al eliminar archivo de Cloudinary:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Eliminar múltiples archivos de Cloudinary
 * @param {Array} publicIds - Array de IDs públicos
 * @param {String} resourceType - Tipo de recurso ('image' o 'video')
 * @returns {Promise<Object>} - Resultado de la eliminación
 */
const deleteMultipleFiles = async (publicIds, resourceType = 'image') => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds, {
      resource_type: resourceType
    });
    
    return {
      success: true,
      deleted: result.deleted,
      partial: result.partial
    };
  } catch (error) {
    console.error('Error al eliminar archivos de Cloudinary:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  cloudinary,
  uploadImage,
  uploadVideo,
  deleteFile,
  deleteMultipleFiles
};
