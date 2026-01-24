-- =====================================================
-- MIGRACIÓN: Agregar tabla variant_images
-- Permite asociar imágenes específicas a cada color
-- =====================================================

-- Crear tabla variant_images
CREATE TABLE IF NOT EXISTS variant_images (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  color VARCHAR(50),  -- NULL = imagen para todos los colores
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_variant_images_product ON variant_images(product_id);
CREATE INDEX idx_variant_images_color ON variant_images(product_id, color);

-- Migrar datos existentes de product_images a variant_images
-- Las imágenes sin color específico se copian como NULL (para todos los colores)
INSERT INTO variant_images (product_id, image_url, color, is_primary, display_order)
SELECT 
  product_id, 
  image_url, 
  NULL as color,  -- Imágenes existentes son para todos los colores
  is_primary, 
  display_order
FROM product_images
WHERE NOT EXISTS (
  SELECT 1 FROM variant_images vi 
  WHERE vi.product_id = product_images.product_id 
  AND vi.image_url = product_images.image_url
);

-- Nota: NO eliminamos la tabla product_images todavía
-- La mantenemos por compatibilidad hasta confirmar que todo funciona
COMMENT ON TABLE variant_images IS 'Imágenes de productos asociadas a colores específicos';
COMMENT ON COLUMN variant_images.color IS 'Color al que pertenece la imagen. NULL = imagen para todos los colores';
