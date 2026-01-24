import React, { useState, useEffect, useRef } from 'react';
import uploadService from '../services/uploadService';

const ProductEditModal = ({ product, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category: '',
    reference_price: '',
    active: true,
    colors: '',
    sizes: ''
  });

  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  
  // Estados para archivos NUEVOS
  const [newImages, setNewImages] = useState([]);
  const [newVideos, setNewVideos] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [newVideoPreviews, setNewVideoPreviews] = useState([]);
  
  // Estados para archivos EXISTENTES
  const [existingImages, setExistingImages] = useState([]);
  const [existingVideos, setExistingVideos] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [videosToDelete, setVideosToDelete] = useState([]);
  
  // NUEVO: Estados para colores de imágenes Y VIDEOS
  const [imageColors, setImageColors] = useState({}); // { imageIndex: colorName }
  const [videoColors, setVideoColors] = useState({}); // { videoIndex: colorName }
  
  const [dragActive, setDragActive] = useState(false);
  
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  useEffect(() => {
    if (product && isOpen) {
      // Si es edición, cargar datos del producto
      setFormData({
        sku: product.sku || '',
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        reference_price: product.reference_price || '',
        active: product.active !== undefined ? product.active : true,
        colors: product.available_colors?.join(', ') || '',
        sizes: product.available_sizes?.join(', ') || ''
      });
      
      // Cargar imágenes con sus colores asignados
      let loadedImages = [];
      const loadedImageColors = {};
      
      if (product.imagesWithColors && product.imagesWithColors.length > 0) {
        // Cargar desde imagesWithColors (formato del backend para admin)
        loadedImages = product.imagesWithColors.map((imgData, index) => ({
          id: `existing-img-${index}`,
          url: imgData.url,
          isExisting: true
        }));
        
        // Cargar colores asignados
        product.imagesWithColors.forEach((imgData, index) => {
          if (imgData.color) {
            loadedImageColors[index] = imgData.color;
          }
        });
      } else if (product.images && product.images.length > 0) {
        // Fallback: cargar desde images simple
        loadedImages = product.images.map((url, index) => ({
          id: `existing-img-${index}`,
          url: url,
          isExisting: true
        }));
      } else if (product.image_url) {
        loadedImages = [{
          id: 'existing-img-0',
          url: product.image_url,
          isExisting: true
        }];
      }
      
      setExistingImages(loadedImages);
      setImageColors(loadedImageColors);
      
      // Cargar videos con sus colores asignados
      const productVideos = product.videos || [];
      const loadedVideoColors = {};
      
      // Si vienen videos con colores desde el backend (futuro)
      if (product.videosWithColors && product.videosWithColors.length > 0) {
        setExistingVideos(product.videosWithColors.map((vidData, index) => ({
          id: `existing-vid-${index}`,
          url: vidData.url,
          isExisting: true
        })));
        
        product.videosWithColors.forEach((vidData, index) => {
          if (vidData.color) {
            loadedVideoColors[index] = vidData.color;
          }
        });
      } else {
        setExistingVideos(productVideos.map((url, index) => ({
          id: `existing-vid-${index}`,
          url: url,
          isExisting: true
        })));
      }
      
      setVideoColors(loadedVideoColors);
      
      // La primera imagen es la portada por defecto
      setPrimaryImageIndex(0);
      
      // Limpiar archivos nuevos
      setNewImages([]);
      setNewVideos([]);
      setNewImagePreviews([]);
      setNewVideoPreviews([]);
      setImagesToDelete([]);
      setVideosToDelete([]);
      setUploadProgress(0);
      setUploadStatus('');
    } else if (isOpen) {
      // Si es nuevo producto, limpiar todo
      setFormData({
        sku: '',
        name: '',
        description: '',
        category: '',
        reference_price: '',
        active: true,
        colors: '',
        sizes: ''
      });
      setExistingImages([]);
      setExistingVideos([]);
      setNewImages([]);
      setNewVideos([]);
      setNewImagePreviews([]);
      setNewVideoPreviews([]);
      setImagesToDelete([]);
      setVideosToDelete([]);
      setImageColors({});
      setVideoColors({});
      setPrimaryImageIndex(0);
      setUploadProgress(0);
      setUploadStatus('');
    }
  }, [product, isOpen]);

  // Generar vista previa de variantes
  useEffect(() => {
    const colores = formData.colors.split(',').map(c => c.trim()).filter(c => c);
    const tallas = formData.sizes.split(',').map(t => t.trim()).filter(t => t);
    
    const newVariants = [];
    if (colores.length > 0 && tallas.length > 0) {
      for (const color of colores) {
        for (const talla of tallas) {
          newVariants.push({
            color,
            size: talla,
            sku_variant: `${formData.sku}-${color.toUpperCase().substring(0, 3)}-${talla}`
          });
        }
      }
    }
    setVariants(newVariants);
  }, [formData.colors, formData.sizes, formData.sku]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // NUEVA FUNCIÓN: Asignar color a una imagen
  const handleImageColorChange = (imageIndex, color) => {
    setImageColors(prev => ({
      ...prev,
      [imageIndex]: color || null
    }));
  };

  // NUEVA FUNCIÓN: Asignar color a un video
  const handleVideoColorChange = (videoIndex, color) => {
    setVideoColors(prev => ({
      ...prev,
      [videoIndex]: color || null
    }));
  };

  // Manejo de NUEVAS imágenes
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files, 'image');
  };

  // Manejo de NUEVOS videos
  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files, 'video');
  };

  const handleFiles = (files, type) => {
    if (type === 'image') {
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      
      const newPreviews = imageFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        isNew: true
      }));
      
      setNewImages(prev => [...prev, ...imageFiles]);
      setNewImagePreviews(prev => [...prev, ...newPreviews]);
    } else if (type === 'video') {
      const videoFiles = files.filter(file => file.type.startsWith('video/'));
      
      const newPreviews = videoFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        isNew: true
      }));
      
      setNewVideos(prev => [...prev, ...videoFiles]);
      setNewVideoPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files, type);
    }
  };

  // Eliminar imagen EXISTENTE
  const removeExistingImage = (imageId, imageIndex) => {
    setImagesToDelete(prev => [...prev, imageId]);
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
    
    // Eliminar el color asignado a esta imagen
    setImageColors(prev => {
      const newColors = { ...prev };
      delete newColors[imageIndex];
      
      // Ajustar índices de colores para imágenes posteriores
      const adjustedColors = {};
      Object.keys(newColors).forEach(key => {
        const idx = parseInt(key);
        if (idx > imageIndex) {
          adjustedColors[idx - 1] = newColors[key];
        } else {
          adjustedColors[idx] = newColors[key];
        }
      });
      
      return adjustedColors;
    });
    
    // Ajustar índice de portada
    if (imageIndex === primaryImageIndex) {
      setPrimaryImageIndex(0);
    } else if (imageIndex < primaryImageIndex) {
      setPrimaryImageIndex(prev => prev - 1);
    }
  };

  // Eliminar imagen NUEVA
  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      if (prev[index]) {
        URL.revokeObjectURL(prev[index].preview);
      }
      return newPreviews;
    });
    
    // Eliminar color asignado
    const absoluteIndex = existingImages.length + index;
    setImageColors(prev => {
      const newColors = { ...prev };
      delete newColors[absoluteIndex];
      
      // Ajustar índices
      const adjustedColors = {};
      Object.keys(newColors).forEach(key => {
        const idx = parseInt(key);
        if (idx > absoluteIndex) {
          adjustedColors[idx - 1] = newColors[key];
        } else {
          adjustedColors[idx] = newColors[key];
        }
      });
      
      return adjustedColors;
    });
    
    // Ajustar índice de portada
    const totalExisting = existingImages.length;
    const absoluteIdx = totalExisting + index;
    if (absoluteIdx === primaryImageIndex) {
      setPrimaryImageIndex(0);
    } else if (absoluteIdx < primaryImageIndex) {
      setPrimaryImageIndex(prev => prev - 1);
    }
  };

  // Eliminar video EXISTENTE
  const removeExistingVideo = (videoId, videoIndex) => {
    setVideosToDelete(prev => [...prev, videoId]);
    setExistingVideos(prev => prev.filter(vid => vid.id !== videoId));
    
    // Eliminar el color asignado a este video
    setVideoColors(prev => {
      const newColors = { ...prev };
      delete newColors[videoIndex];
      
      // Ajustar índices de colores para videos posteriores
      const adjustedColors = {};
      Object.keys(newColors).forEach(key => {
        const idx = parseInt(key);
        if (idx > videoIndex) {
          adjustedColors[idx - 1] = newColors[key];
        } else {
          adjustedColors[idx] = newColors[key];
        }
      });
      
      return adjustedColors;
    });
  };

  // Eliminar video NUEVO
  const removeNewVideo = (index) => {
    setNewVideos(prev => prev.filter((_, i) => i !== index));
    setNewVideoPreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      if (prev[index]) {
        URL.revokeObjectURL(prev[index].preview);
      }
      return newPreviews;
    });
    
    // Eliminar color asignado
    const absoluteIndex = existingVideos.length + index;
    setVideoColors(prev => {
      const newColors = { ...prev };
      delete newColors[absoluteIndex];
      
      // Ajustar índices
      const adjustedColors = {};
      Object.keys(newColors).forEach(key => {
        const idx = parseInt(key);
        if (idx > absoluteIndex) {
          adjustedColors[idx - 1] = newColors[key];
        } else {
          adjustedColors[idx] = newColors[key];
        }
      });
      
      return adjustedColors;
    });
  };

  // Marcar imagen como portada
  const setPrimaryImage = (index) => {
    setPrimaryImageIndex(index);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress(0);

    try {
      const totalFiles = newImages.length + newVideos.length;
      let uploadedFiles = 0;

      // PASO 1: Subir NUEVAS imágenes a Cloudinary
      setUploadStatus('Subiendo imágenes...');
      const uploadedImageUrls = [];
      
      if (newImages.length > 0) {
        const imageUploadResult = await uploadService.uploadImages(newImages);
        
        if (imageUploadResult.success) {
          uploadedImageUrls.push(...imageUploadResult.images.map(img => img.url));
          uploadedFiles += newImages.length;
          setUploadProgress(Math.round((uploadedFiles / totalFiles) * 100));
        } else {
          throw new Error('Error al subir imágenes');
        }
      }

      // PASO 2: Subir NUEVOS videos a Cloudinary
      setUploadStatus('Subiendo videos...');
      const uploadedVideoUrls = [];
      
      if (newVideos.length > 0) {
        const videoUploadResult = await uploadService.uploadVideos(newVideos);
        
        if (videoUploadResult.success) {
          uploadedVideoUrls.push(...videoUploadResult.videos.map(vid => vid.url));
          uploadedFiles += newVideos.length;
          setUploadProgress(Math.round((uploadedFiles / totalFiles) * 100));
        } else {
          throw new Error('Error al subir videos');
        }
      }

      // PASO 3: Combinar URLs existentes + nuevas
      const allImageUrls = [
        ...existingImages.map(img => img.url),
        ...uploadedImageUrls
      ];

      const allVideoUrls = [
        ...existingVideos.map(vid => vid.url),
        ...uploadedVideoUrls
      ];

      // PASO 4: Preparar imagesWithColors con formato { url, color }
      const imagesWithColors = allImageUrls.map((url, index) => ({
        url: url,
        color: imageColors[index] || null
      }));

      // PASO 4.5: Preparar videosWithColors con formato { url, color }
      console.log('DEBUG - Estado videoColors antes de mapear:', videoColors);
      console.log('DEBUG - allVideoUrls:', allVideoUrls);
      
      const videosWithColors = allVideoUrls.map((url, index) => ({
        url: url,
        color: videoColors[index] || null
      }));
      
      console.log('DEBUG - videosWithColors mapeado:', videosWithColors);

      // PASO 5: Preparar datos para enviar al backend
      setUploadStatus('Guardando producto...');
      const dataToSend = {
        ...formData,
        reference_price: parseFloat(formData.reference_price),
        colors: formData.colors.split(',').map(c => c.trim()).filter(c => c),
        sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s),
        images: allImageUrls, // Mantener para compatibilidad
        videos: allVideoUrls, // Mantener para compatibilidad
        imagesWithColors: imagesWithColors, // NUEVO: enviar con colores
        videosWithColors: videosWithColors, // NUEVO: enviar videos con colores
        primaryImageIndex: primaryImageIndex
      };

      console.log('Datos a enviar:', dataToSend);

      // PASO 6: Guardar en la base de datos
      await onSave(dataToSend, product?.id);
      
      setUploadStatus('¡Completado!');
      setUploadProgress(100);
      
      setTimeout(() => {
        onClose();
      }, 500);

    } catch (error) {
      console.error('Error al guardar:', error);
      setUploadStatus('Error al guardar');
      alert(error.message || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  // Limpiar URLs cuando se cierre el modal
  useEffect(() => {
    return () => {
      newImagePreviews.forEach(img => URL.revokeObjectURL(img.preview));
      newVideoPreviews.forEach(vid => URL.revokeObjectURL(vid.preview));
    };
  }, [newImagePreviews, newVideoPreviews]);

  if (!isOpen) return null;

  const categorias = [
    'Uniformes',
    'Camisas',
    'Pantalones',
    'Chalecos',
    'Accesorios',
    'Materia Prima',
    'Drones'
  ];

  // Calcular totales
  const totalImages = existingImages.length + newImagePreviews.length;
  const totalVideos = existingVideos.length + newVideoPreviews.length;
  
  // Obtener colores disponibles
  const availableColors = formData.colors.split(',').map(c => c.trim()).filter(c => c);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl z-50 overflow-hidden"
        style={{ width: '1000px', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2
            style={{
              fontFamily: 'graphik, helvetica, sans-serif',
              fontWeight: 500,
              color: 'rgb(51, 51, 51)',
              fontSize: '20px'
            }}
          >
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
            disabled={loading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        {loading && uploadProgress > 0 && (
          <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700" style={{ fontFamily: 'graphik, helvetica, sans-serif' }}>
                {uploadStatus}
              </span>
              <span className="text-sm font-medium text-blue-700" style={{ fontFamily: 'graphik, helvetica, sans-serif' }}>
                {uploadProgress}%
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Contenido con scroll */}
        <form onSubmit={handleSubmit} className="overflow-y-auto" style={{ maxHeight: loading ? 'calc(90vh - 200px)' : 'calc(90vh - 140px)' }}>
          <div className="px-6 py-4 space-y-6">
            
            {/* SECCIÓN: INFORMACIÓN BÁSICA (Primero para definir colores) */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium mb-4" style={{ fontFamily: 'graphik, helvetica, sans-serif' }}>
                Información Básica
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-2" style={{ fontFamily: 'graphik, helvetica, sans-serif', fontSize: '14px' }}>
                    SKU *
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black disabled:opacity-50"
                    placeholder="UNI001"
                  />
                </div>

                <div>
                  <label className="block mb-2" style={{ fontFamily: 'graphik, helvetica, sans-serif', fontSize: '14px' }}>
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black disabled:opacity-50"
                    placeholder="Camisa Polo Corporativa"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block mb-2" style={{ fontFamily: 'graphik, helvetica, sans-serif', fontSize: '14px' }}>
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={loading}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black disabled:opacity-50"
                  placeholder="Descripción detallada del producto..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-2" style={{ fontFamily: 'graphik, helvetica, sans-serif', fontSize: '14px' }}>
                    Categoría *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black disabled:opacity-50"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2" style={{ fontFamily: 'graphik, helvetica, sans-serif', fontSize: '14px' }}>
                    Precio de Referencia (₡) *
                  </label>
                  <input
                    type="number"
                    name="reference_price"
                    value={formData.reference_price}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black disabled:opacity-50"
                    placeholder="15000"
                  />
                </div>
              </div>

              {/* Colores - IMPORTANTE: definir antes de las imágenes */}
              <div className="mb-4">
                <label className="block mb-2" style={{ fontFamily: 'graphik, helvetica, sans-serif', fontSize: '14px' }}>
                  Colores (separados por comas) *
                </label>
                <input
                  type="text"
                  name="colors"
                  value={formData.colors}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black disabled:opacity-50"
                  placeholder="Verde, Rojo, Azul"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Define primero los colores para poder asignarlos a las imágenes
                </p>
              </div>

              {/* Tallas */}
              <div className="mb-4">
                <label className="block mb-2" style={{ fontFamily: 'graphik, helvetica, sans-serif', fontSize: '14px' }}>
                  Tallas (separados por comas)
                </label>
                <input
                  type="text"
                  name="sizes"
                  value={formData.sizes}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black disabled:opacity-50"
                  placeholder="S, M, L, XL"
                />
              </div>
            </div>
            
            {/* SECCIÓN: MULTIMEDIA */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium mb-4" style={{ fontFamily: 'graphik, helvetica, sans-serif' }}>
                Imágenes y Videos
              </h3>
              
              {availableColors.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800" style={{ fontFamily: 'graphik, helvetica, sans-serif' }}>
                    ⚠️ Define primero los colores del producto arriba para poder asignarlos a las imágenes
                  </p>
                </div>
              )}
              
              {/* Imágenes */}
              <div className="mb-6">
                <label className="block mb-2" style={{ fontFamily: 'graphik, helvetica, sans-serif', fontWeight: 500, fontSize: '14px' }}>
                  Imágenes del Producto {totalImages > 0 && `(${totalImages})`}
                </label>
                
                {/* Imágenes EXISTENTES */}
                {existingImages.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 mb-2" style={{ fontFamily: 'graphik, helvetica, sans-serif' }}>
                      Imágenes actuales:
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      {existingImages.map((img, index) => {
                        const isPortada = index === primaryImageIndex;
                        const assignedColor = imageColors[index];
                        
                        return (
                          <div key={img.id} className="relative group">
                            <img
                              src={img.url}
                              alt="Imagen existente"
                              className={`w-full h-40 object-cover rounded-lg border-2 ${
                                isPortada ? 'border-yellow-400' : 'border-blue-200'
                              }`}
                            />
                            
                            {/* Badge de Actual */}
                            <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                              Actual
                            </div>
                            
                            {/* Badge de Portada */}
                            {isPortada && (
                              <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded flex items-center gap-1">
                                ★ Portada
                              </div>
                            )}
                            
                            {/* Dropdown de Color */}
                            {availableColors.length > 0 && (
                              <div className="absolute bottom-2 left-2 right-2">
                                <select
                                  value={assignedColor || ''}
                                  onChange={(e) => handleImageColorChange(index, e.target.value)}
                                  disabled={loading}
                                  className="w-full text-xs px-2 py-1 border border-gray-300 rounded bg-white/95 disabled:opacity-50"
                                  style={{ fontFamily: 'graphik, helvetica, sans-serif' }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <option value="">Sin color específico</option>
                                  {availableColors.map(color => (
                                    <option key={color} value={color}>{color}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                            
                            {/* Botón Marcar Portada */}
                            {!isPortada && (
                              <button
                                type="button"
                                onClick={() => setPrimaryImage(index)}
                                disabled={loading}
                                className="absolute top-10 left-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                              >
                                ★ Marcar portada
                              </button>
                            )}
                            
                            {/* Botón Eliminar */}
                            <button
                              type="button"
                              onClick={() => removeExistingImage(img.id, index)}
                              disabled={loading}
                              className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center disabled:opacity-50"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Zona de drop NUEVAS imágenes */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                    loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                  } ${
                    dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={(e) => !loading && handleDrop(e, 'image')}
                  onClick={() => !loading && imageInputRef.current?.click()}
                >
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-600 mb-1" style={{ fontFamily: 'graphik, helvetica, sans-serif' }}>
                    Arrastra imágenes aquí o haz click
                  </p>
                  <p className="text-xs text-gray-500" style={{ fontFamily: 'graphik, helvetica, sans-serif' }}>
                    PNG, JPG, WEBP hasta 10MB
                  </p>
                  <input
                    ref={imageInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={loading}
                  />
                </div>

                {/* Preview NUEVAS imágenes */}
                {newImagePreviews.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-600 mb-2" style={{ fontFamily: 'graphik, helvetica, sans-serif' }}>
                      Nuevas imágenes:
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      {newImagePreviews.map((img, index) => {
                        const absoluteIndex = existingImages.length + index;
                        const isPortada = absoluteIndex === primaryImageIndex;
                        const assignedColor = imageColors[absoluteIndex];
                        
                        return (
                          <div key={index} className="relative group">
                            <img
                              src={img.preview}
                              alt={`Preview ${index + 1}`}
                              className={`w-full h-40 object-cover rounded-lg border-2 ${
                                isPortada ? 'border-yellow-400' : 'border-green-200'
                              }`}
                            />
                            
                            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                              Nueva
                            </div>
                            
                            {isPortada && (
                              <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded flex items-center gap-1">
                                ★ Portada
                              </div>
                            )}
                            
                            {/* Dropdown de Color */}
                            {availableColors.length > 0 && (
                              <div className="absolute bottom-2 left-2 right-2">
                                <select
                                  value={assignedColor || ''}
                                  onChange={(e) => handleImageColorChange(absoluteIndex, e.target.value)}
                                  disabled={loading}
                                  className="w-full text-xs px-2 py-1 border border-gray-300 rounded bg-white/95 disabled:opacity-50"
                                  style={{ fontFamily: 'graphik, helvetica, sans-serif' }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <option value="">Sin color específico</option>
                                  {availableColors.map(color => (
                                    <option key={color} value={color}>{color}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                            
                            {!isPortada && (
                              <button
                                type="button"
                                onClick={() => setPrimaryImage(absoluteIndex)}
                                disabled={loading}
                                className="absolute top-10 left-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                              >
                                ★ Marcar portada
                              </button>
                            )}
                            
                            <button
                              type="button"
                              onClick={() => removeNewImage(index)}
                              disabled={loading}
                              className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center disabled:opacity-50"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Videos */}
              <div>
                <label className="block mb-2" style={{ fontFamily: 'graphik, helvetica, sans-serif', fontWeight: 500, fontSize: '14px' }}>
                  Videos del Producto {totalVideos > 0 && `(${totalVideos})`}
                </label>
                
                {existingVideos.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 mb-2">Videos actuales:</p>
                    <div className="grid grid-cols-3 gap-4">
                      {existingVideos.map((vid, index) => {
                        const assignedColor = videoColors[index];
                        
                        return (
                          <div key={vid.id} className="relative group">
                            <video src={vid.url} className="w-full h-32 object-cover rounded-lg border-2 border-blue-200" controls />
                            <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                              Actual
                            </div>
                            
                            {/* Dropdown de Color */}
                            {availableColors.length > 0 && (
                              <div className="absolute bottom-2 left-2 right-2">
                                <select
                                  value={assignedColor || ''}
                                  onChange={(e) => handleVideoColorChange(index, e.target.value)}
                                  disabled={loading}
                                  className="w-full text-xs px-2 py-1 border border-gray-300 rounded bg-white/95 disabled:opacity-50"
                                  style={{ fontFamily: 'graphik, helvetica, sans-serif' }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <option value="">Sin color específico</option>
                                  {availableColors.map(color => (
                                    <option key={color} value={color}>{color}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                            
                            <button
                              type="button"
                              onClick={() => removeExistingVideo(vid.id, index)}
                              disabled={loading}
                              className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center disabled:opacity-50"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center ${
                    loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                  } border-gray-300 hover:border-gray-400`}
                  onClick={() => !loading && videoInputRef.current?.click()}
                >
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-600">Arrastra videos o haz click</p>
                  <input
                    ref={videoInputRef}
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                    disabled={loading}
                  />
                </div>

                {newVideoPreviews.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-600 mb-2">Nuevos videos:</p>
                    <div className="grid grid-cols-3 gap-4">
                      {newVideoPreviews.map((vid, index) => {
                        const absoluteIndex = existingVideos.length + index;
                        const assignedColor = videoColors[absoluteIndex];
                        
                        return (
                          <div key={index} className="relative group">
                            <video src={vid.preview} className="w-full h-32 object-cover rounded-lg border-2 border-green-200" controls />
                            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                              Nuevo
                            </div>
                            
                            {/* Dropdown de Color */}
                            {availableColors.length > 0 && (
                              <div className="absolute bottom-2 left-2 right-2">
                                <select
                                  value={assignedColor || ''}
                                  onChange={(e) => handleVideoColorChange(absoluteIndex, e.target.value)}
                                  disabled={loading}
                                  className="w-full text-xs px-2 py-1 border border-gray-300 rounded bg-white/95 disabled:opacity-50"
                                  style={{ fontFamily: 'graphik, helvetica, sans-serif' }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <option value="">Sin color específico</option>
                                  {availableColors.map(color => (
                                    <option key={color} value={color}>{color}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                            
                            <button
                              type="button"
                              onClick={() => removeNewVideo(index)}
                              disabled={loading}
                              className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center disabled:opacity-50"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Vista previa de variantes */}
            {variants.length > 0 && (
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium mb-4" style={{ fontFamily: 'graphik, helvetica, sans-serif' }}>
                  Vista Previa de Variantes
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="mb-3 text-sm" style={{ fontFamily: 'graphik, helvetica, sans-serif' }}>
                    Se crearán {variants.length} variantes:
                  </p>
                  <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                    {variants.slice(0, 16).map((variant, idx) => (
                      <div key={idx} className="text-xs bg-white px-3 py-2 rounded border">
                        {variant.color} - {variant.size}
                      </div>
                    ))}
                    {variants.length > 16 && (
                      <div className="text-xs text-gray-500 px-3 py-2">
                        +{variants.length - 16} más...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Estado activo */}
            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black disabled:opacity-50"
                />
                <label className="ml-2 text-sm" style={{ fontFamily: 'graphik, helvetica, sans-serif' }}>
                  Producto activo
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-600" style={{ fontFamily: 'graphik, helvetica, sans-serif' }}>
              {totalImages > 0 && `📷 ${totalImages} imagen(es) `}
              {totalVideos > 0 && `🎥 ${totalVideos} video(s)`}
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                style={{ fontFamily: 'graphik, helvetica, sans-serif' }}
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-lg disabled:opacity-50"
                style={{
                  fontFamily: 'graphik, helvetica, sans-serif',
                  fontWeight: 500,
                  backgroundColor: '#000000',
                  color: '#FFFFFF'
                }}
              >
                {loading ? uploadStatus || 'Guardando...' : 'Guardar Producto'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default ProductEditModal;
