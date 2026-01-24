-- =====================================================
-- CORPORACIÓN ARGOM - DATABASE SCHEMA V2
-- E-COMMERCE CON VARIANTES, IMÁGENES, WISHLIST Y CARRITO
-- =====================================================

-- Eliminar tablas si existen (para desarrollo)
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS wishlist CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS client_product_prices CASCADE;
DROP TABLE IF EXISTS client_products CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

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
    email VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('client_user', 'master_admin')),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: products (MODIFICADA)
-- Descripción: Catálogo general de productos
-- CAMBIOS: Removido size, color, image_url
--          Agregado category, reference_price
-- =====================================================
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),              -- Uniformes, Camisas, Pantalones, etc.
    reference_price DECIMAL(10, 2),     -- Precio de referencia base
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: product_images (NUEVA)
-- Descripción: Múltiples imágenes por producto
-- =====================================================
CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,    -- Orden de visualización
    is_primary BOOLEAN DEFAULT false,   -- Imagen principal para el grid
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: product_variants (NUEVA)
-- Descripción: Variantes de color, talla y stock
-- =====================================================
CREATE TABLE product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    color VARCHAR(50),
    size VARCHAR(50),
    sku_variant VARCHAR(100) UNIQUE,    -- SKU específico: PROD001-ROJO-M
    stock_quantity INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, color, size)
);

-- =====================================================
-- TABLA: wishlist (NUEVA)
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
-- TABLA: cart_items (NUEVA)
-- Descripción: Carrito de compras temporal
-- =====================================================
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id INTEGER REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2),          -- Precio al momento de agregar
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
-- Descripción: Último precio confirmado por cliente/producto
-- IMPORTANTE: Se actualiza cuando se CONFIRMA una OC
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
-- ÍNDICES para mejorar performance
-- =====================================================
CREATE INDEX idx_users_client_id ON users(client_id);
CREATE INDEX idx_users_user_name ON users(user_name);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_client_products_client_id ON client_products(client_id);
CREATE INDEX idx_client_products_product_id ON client_products(product_id);
CREATE INDEX idx_purchase_orders_client_id ON purchase_orders(client_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_order_items_purchase_order_id ON order_items(purchase_order_id);

-- =====================================================
-- FOREIGN KEY para client_product_prices
-- =====================================================
ALTER TABLE client_product_prices 
ADD CONSTRAINT fk_last_order 
FOREIGN KEY (last_order_id) 
REFERENCES purchase_orders(id) 
ON DELETE SET NULL;

-- =====================================================
-- DATOS INICIALES DE PRUEBA
-- =====================================================

-- Insertar clientes
INSERT INTO clients (company_name, email, phone, address) VALUES
('Carnes Doradas de Costa Rica S.A.', 'info@carnesDoradas.cr', '2222-3333', 'San José, Costa Rica'),
('COMINSA S.A.', 'info@cominsa.cr', '2222-4444', 'Heredia, Costa Rica'),
('Finca 8 del Norte S.A.', 'info@finca8.cr', '2222-5555', 'Alajuela, Costa Rica'),
('K-9 Internacional S.A.', 'info@k9intl.cr', '2222-6666', 'Cartago, Costa Rica');

-- Insertar usuario maestro (admin)
-- Contraseña: admin123 (debe ser cambiada en producción)
INSERT INTO users (client_id, user_name, email, password, role) VALUES
(NULL, 'admin_master', 'admin@corporacionargom.com', '$2a$10$placeholder', 'master_admin');

-- Insertar usuarios de clientes
-- Contraseña: password123 (debe ser cambiada en producción)
INSERT INTO users (client_id, user_name, email, password, role) VALUES
(1, 'carnes_doradas', 'carnes@doradas.cr', '$2a$10$placeholder', 'client_user'),
(2, 'wendell_montero', 'wendell@cominsa.cr', '$2a$10$placeholder', 'client_user'),
(3, 'finca_8_del_norte', 'finca8@norte.cr', '$2a$10$placeholder', 'client_user'),
(4, 'francisco_gutierrez', 'francisco@k9intl.cr', '$2a$10$placeholder', 'client_user'),
(4, 'carolina_sibaja', 'carolina@k9intl.cr', '$2a$10$placeholder', 'client_user'),
(4, 'christian_asi', 'christian@k9intl.cr', '$2a$10$placeholder', 'client_user');

-- Insertar productos de ejemplo con CATEGORÍAS
INSERT INTO products (sku, name, description, category, reference_price) VALUES
('UNI001', 'Camisa Polo Corporativa', 'Camisa polo 100% algodón con bordado incluido', 'Uniformes', 15000.00),
('PAN001', 'Pantalón Cargo Multibolsillos', 'Pantalón cargo resistente con múltiples compartimentos', 'Pantalones', 25000.00),
('ACC001', 'Gorra Deportiva Bordada', 'Gorra con logo bordado personalizado', 'Accesorios', 8000.00),
('UNI002', 'Chaleco Ejecutivo', 'Chaleco formal para uniformes ejecutivos', 'Uniformes', 35000.00),
('CAM001', 'Camisa Oxford', 'Camisa de vestir manga larga', 'Camisas', 18000.00),
('TAC001', 'Ballistic Helmet', 'Casco balístico de alta protección', 'Accesorios', 120000.00);

-- Insertar IMÁGENES para los productos
-- Producto 1: Camisa Polo
INSERT INTO product_images (product_id, image_url, display_order, is_primary) VALUES
(1, '/assets/images/Nuevo1.png', 1, true),
(1, '/assets/images/Nuevo2.png', 2, false),
(1, '/assets/images/Nuevo3.png', 3, false);

-- Producto 2: Pantalón Cargo
INSERT INTO product_images (product_id, image_url, display_order, is_primary) VALUES
(2, '/assets/images/Nuevo4.png', 1, true),
(2, '/assets/images/Nuevo5.png', 2, false);

-- Producto 3: Gorra
INSERT INTO product_images (product_id, image_url, display_order, is_primary) VALUES
(3, '/assets/images/Nuevo6.png', 1, true);

-- Producto 4: Chaleco
INSERT INTO product_images (product_id, image_url, display_order, is_primary) VALUES
(4, '/assets/images/Nuevo2.png', 1, true);

-- Producto 5: Camisa Oxford
INSERT INTO product_images (product_id, image_url, display_order, is_primary) VALUES
(5, '/assets/images/Nuevo1.png', 1, true);

-- Producto 6: Ballistic Helmet
INSERT INTO product_images (product_id, image_url, display_order, is_primary) VALUES
(6, '/assets/images/Nuevo1.png', 1, true);

-- Insertar VARIANTES (colores y tallas)
-- Producto 1: Camisa Polo (Varios colores y tallas)
INSERT INTO product_variants (product_id, color, size, sku_variant, stock_quantity) VALUES
(1, 'Rojo', 'S', 'UNI001-ROJO-S', 50),
(1, 'Rojo', 'M', 'UNI001-ROJO-M', 100),
(1, 'Rojo', 'L', 'UNI001-ROJO-L', 75),
(1, 'Azul', 'S', 'UNI001-AZUL-S', 40),
(1, 'Azul', 'M', 'UNI001-AZUL-M', 80),
(1, 'Azul', 'L', 'UNI001-AZUL-L', 60),
(1, 'Negro', 'M', 'UNI001-NEGRO-M', 90),
(1, 'Negro', 'L', 'UNI001-NEGRO-L', 70);

-- Producto 2: Pantalón Cargo
INSERT INTO product_variants (product_id, color, size, sku_variant, stock_quantity) VALUES
(2, 'Negro', 'M', 'PAN001-NEGRO-M', 60),
(2, 'Negro', 'L', 'PAN001-NEGRO-L', 80),
(2, 'Caqui', 'M', 'PAN001-CAQUI-M', 50),
(2, 'Caqui', 'L', 'PAN001-CAQUI-L', 70);

-- Producto 3: Gorra (Talla única, varios colores)
INSERT INTO product_variants (product_id, color, size, sku_variant, stock_quantity) VALUES
(3, 'Azul', 'Única', 'ACC001-AZUL-UNI', 100),
(3, 'Negro', 'Única', 'ACC001-NEGRO-UNI', 120),
(3, 'Blanco', 'Única', 'ACC001-BLANCO-UNI', 80);

-- Asignar productos a clientes (todos los clientes ven todos los productos)
INSERT INTO client_products (client_id, product_id) VALUES
-- Cliente 1: Carnes Doradas
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6),
-- Cliente 2: COMINSA
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6),
-- Cliente 3: Finca 8
(3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (3, 6),
-- Cliente 4: K-9
(4, 1), (4, 2), (4, 3), (4, 4), (4, 5), (4, 6);

-- =====================================================
-- FIN DEL SCHEMA V2
-- =====================================================
