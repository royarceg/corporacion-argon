-- =====================================================
-- Script para agregar soporte de videos por variante (color)
-- Fecha: 2026-01-16
-- =====================================================

-- 1. Crear nueva tabla variant_videos (similar a variant_images)
CREATE TABLE IF NOT EXISTS variant_videos (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  color VARCHAR(50),  -- NULL = video para todas las variantes
  thumbnail_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_variant_videos_product_id ON variant_videos(product_id);
CREATE INDEX IF NOT EXISTS idx_variant_videos_color ON variant_videos(product_id, color);

-- 3. Migrar videos existentes de product_videos a variant_videos
-- (con color NULL para indicar que son para todas las variantes)
INSERT INTO variant_videos (product_id, video_url, thumbnail_url, display_order)
SELECT 
  product_id, 
  video_url,
  thumbnail_url,
  display_order
FROM product_videos
WHERE NOT EXISTS (
  SELECT 1 FROM variant_videos vv 
  WHERE vv.product_id = product_videos.product_id 
  AND vv.video_url = product_videos.video_url
);

-- 4. Verificar migración
SELECT 
  'Videos migrados:' as status,
  COUNT(*) as total_videos
FROM variant_videos;

COMMIT;
