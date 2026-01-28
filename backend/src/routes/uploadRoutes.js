const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadImage, uploadVideo, deleteFile } = require('../config/cloudinary');
const { authenticateToken, isMasterAdmin } = require('../middleware/authMiddleware');

// =====================================================
// CONFIGURACIÓN DE TIPOS DE ARCHIVO PERMITIDOS
// =====================================================

// Tipos MIME permitidos para imágenes
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp'
];

// Tipos MIME permitidos para videos
const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/mpeg',
  'video/quicktime',  // .mov
  'video/x-msvideo',  // .avi
  'video/webm'
];

// =====================================================
// FILTROS DE ARCHIVO
// =====================================================

// Filtro para imágenes
const imageFileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido. Solo se aceptan: ${ALLOWED_IMAGE_TYPES.map(t => t.split('/')[1]).join(', ')}`), false);
  }
};

// Filtro para videos
const videoFileFilter = (req, file, cb) => {
  if (ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido. Solo se aceptan: ${ALLOWED_VIDEO_TYPES.map(t => t.split('/')[1]).join(', ')}`), false);
  }
};

// =====================================================
// CONFIGURACIÓN DE MULTER
// =====================================================

const storage = multer.memoryStorage();

// Multer para imágenes (máx 10MB)
const uploadImageMulter = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB para imágenes
  },
  fileFilter: imageFileFilter
});

// Multer para videos (máx 50MB)
const uploadVideoMulter = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB para videos
  },
  fileFilter: videoFileFilter
});

// =====================================================
// MIDDLEWARE PARA MANEJAR ERRORES DE MULTER
// =====================================================

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'El archivo excede el tamaño máximo permitido' });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

// =====================================================
// RUTAS DE UPLOAD
// =====================================================

/**
 * POST /api/upload/image
 * Subir una imagen a Cloudinary
 */
router.post('/image', authenticateToken, isMasterAdmin, uploadImageMulter.single('file'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    // Convertir buffer a base64 data URI
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Subir a Cloudinary
    const result = await uploadImage(dataURI);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      url: result.url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format
    });
  } catch (error) {
    console.error('Error en upload/image:', error);
    res.status(500).json({ error: 'Error al subir la imagen' });
  }
});

/**
 * POST /api/upload/images
 * Subir múltiples imágenes a Cloudinary
 */
router.post('/images', authenticateToken, isMasterAdmin, uploadImageMulter.array('files', 10), handleMulterError, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron archivos' });
    }

    const uploadPromises = req.files.map(async (file) => {
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;
      return await uploadImage(dataURI);
    });

    const results = await Promise.all(uploadPromises);

    // Verificar si hubo errores
    const errors = results.filter(r => !r.success);
    if (errors.length > 0) {
      return res.status(500).json({ 
        error: 'Algunas imágenes no se pudieron subir',
        details: errors
      });
    }

    res.json({
      success: true,
      images: results.map(r => ({
        url: r.url,
        public_id: r.public_id,
        width: r.width,
        height: r.height,
        format: r.format
      }))
    });
  } catch (error) {
    console.error('Error en upload/images:', error);
    res.status(500).json({ error: 'Error al subir las imágenes' });
  }
});

/**
 * POST /api/upload/video
 * Subir un video a Cloudinary
 */
router.post('/video', authenticateToken, isMasterAdmin, uploadVideoMulter.single('file'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    // Convertir buffer a base64 data URI
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Subir a Cloudinary
    const result = await uploadVideo(dataURI);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      url: result.url,
      public_id: result.public_id,
      duration: result.duration,
      width: result.width,
      height: result.height,
      format: result.format
    });
  } catch (error) {
    console.error('Error en upload/video:', error);
    res.status(500).json({ error: 'Error al subir el video' });
  }
});

/**
 * POST /api/upload/videos
 * Subir múltiples videos a Cloudinary
 */
router.post('/videos', authenticateToken, isMasterAdmin, uploadVideoMulter.array('files', 5), handleMulterError, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron archivos' });
    }

    const uploadPromises = req.files.map(async (file) => {
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;
      return await uploadVideo(dataURI);
    });

    const results = await Promise.all(uploadPromises);

    // Verificar si hubo errores
    const errors = results.filter(r => !r.success);
    if (errors.length > 0) {
      return res.status(500).json({ 
        error: 'Algunos videos no se pudieron subir',
        details: errors
      });
    }

    res.json({
      success: true,
      videos: results.map(r => ({
        url: r.url,
        public_id: r.public_id,
        duration: r.duration,
        width: r.width,
        height: r.height,
        format: r.format
      }))
    });
  } catch (error) {
    console.error('Error en upload/videos:', error);
    res.status(500).json({ error: 'Error al subir los videos' });
  }
});

/**
 * DELETE /api/upload/file
 * Eliminar un archivo de Cloudinary
 */
router.delete('/file', authenticateToken, isMasterAdmin, async (req, res) => {
  try {
    const { public_id, resource_type = 'image' } = req.body;

    if (!public_id) {
      return res.status(400).json({ error: 'Se requiere el public_id del archivo' });
    }

    const result = await deleteFile(public_id, resource_type);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      message: 'Archivo eliminado correctamente'
    });
  } catch (error) {
    console.error('Error en delete/file:', error);
    res.status(500).json({ error: 'Error al eliminar el archivo' });
  }
});

module.exports = router;
