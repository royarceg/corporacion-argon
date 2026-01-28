-- =====================================================
-- CORPORACIÓN ARGOM - DATABASE SCHEMA
-- =====================================================
-- 
-- ⚠️  IMPORTANTE: Este archivo es SOLO DOCUMENTACIÓN
--     NO ejecutar en producción - solo es referencia
--     de la estructura actual de la base de datos.
--
-- Base de datos: PostgreSQL (Railway)
-- Última actualización: Enero 2025
-- =====================================================


-- =====================================================
-- TABLA: clients
-- Descripción: Empresas clientes de Corporación Argom
-- =====================================================
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================
-- TABLA: users
-- Descripción: Usuarios del sistema (clientes y admin)
-- =====================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    user_name VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),                      -- Nombre completo del usuario
    email VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('client_user', 'master_admin')),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================
-- TABLA: products
-- Descripción: Catálogo general de productos
-- =====================================================
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    reference_price DECIMAL(10, 2),
    variant_group VARCHAR(100),             -- Agrupa productos relacionados (ej: ZAP)
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================
-- TABLA: product_images
-- Descripción: Imágenes de productos (compatibilidad)
-- =====================================================
CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    public_id TEXT,                         -- ID de Cloudinary
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================
-- TABLA: variant_images
-- Descripción: Imágenes asociadas a colores específicos
-- =====================================================
CREATE TABLE variant_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    color VARCHAR(50),                      -- NULL = imagen para todos los colores
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================
-- TABLA: product_videos
-- Descripción: Videos de productos (compatibilidad)
-- =====================================================
CREATE TABLE product_videos (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    public_id TEXT,                         -- ID de Cloudinary
    thumbnail_url TEXT,
    duration INTEGER,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================
-- TABLA: variant_videos
-- Descripción: Videos asociados a colores específicos
-- =====================================================
CREATE TABLE variant_videos (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    color VARCHAR(50),                      -- NULL = video para todos los colores
    thumbnail_url TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================
-- TABLA: product_variants
-- Descripción: Variantes de color y talla por producto
-- =====================================================
CREATE TABLE product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    color VARCHAR(50),
    size VARCHAR(50),
    sku_variant VARCHAR(100) UNIQUE,
    stock_quantity INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, color, size)
);


-- =====================================================
-- TABLA: client_products
-- Descripción: Productos asignados a cada cliente
-- =====================================================
CREATE TABLE client_products (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    active BOOLEAN DEFAULT true,
    UNIQUE(client_id, product_id)
);


-- =====================================================
-- TABLA: client_product_prices
-- Descripción: Precios personalizados por cliente
-- =====================================================
CREATE TABLE client_product_prices (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    price DECIMAL(10, 2) NOT NULL,
    last_order_id INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id, product_id)
);


-- =====================================================
-- TABLA: wishlist
-- Descripción: Lista de deseos por usuario
-- =====================================================
CREATE TABLE wishlist (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);


-- =====================================================
-- TABLA: cart_items
-- Descripción: Carrito de compras
-- =====================================================
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id INTEGER REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================
-- TABLA: purchase_orders
-- Descripción: Órdenes de compra
-- =====================================================
CREATE TABLE purchase_orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    customer_po VARCHAR(100),
    wanted_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    subtotal_initial DECIMAL(10, 2) DEFAULT 0,
    subtotal_confirmed DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================
-- TABLA: order_items
-- Descripción: Detalle de productos en cada orden
-- =====================================================
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    purchase_order_id INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity_requested INTEGER NOT NULL,
    quantity_confirmed INTEGER,
    unit_price_initial DECIMAL(10, 2) NOT NULL,
    unit_price_confirmed DECIMAL(10, 2),
    line_total_initial DECIMAL(10, 2) NOT NULL,
    line_total_confirmed DECIMAL(10, 2)
);


-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX idx_users_client_id ON users(client_id);
CREATE INDEX idx_users_user_name ON users(user_name);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_variant_group ON products(variant_group);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_primary ON product_images(product_id, is_primary);
CREATE INDEX idx_variant_images_product_id ON variant_images(product_id);
CREATE INDEX idx_variant_images_color ON variant_images(product_id, color);
CREATE INDEX idx_product_videos_product_id ON product_videos(product_id);
CREATE INDEX idx_variant_videos_product_id ON variant_videos(product_id);
CREATE INDEX idx_variant_videos_color ON variant_videos(product_id, color);
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_client_products_client_id ON client_products(client_id);
CREATE INDEX idx_client_products_product_id ON client_products(product_id);
CREATE INDEX idx_purchase_orders_client_id ON purchase_orders(client_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_order_items_purchase_order_id ON order_items(purchase_order_id);


-- =====================================================
-- FOREIGN KEYS ADICIONALES
-- =====================================================
ALTER TABLE client_product_prices 
ADD CONSTRAINT fk_last_order 
FOREIGN KEY (last_order_id) 
REFERENCES purchase_orders(id) 
ON DELETE SET NULL;


-- =====================================================
-- FIN DEL SCHEMA
-- =====================================================
