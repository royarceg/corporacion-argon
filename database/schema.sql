-- =====================================================
-- CORPORACIÓN ARGOM - DATABASE SCHEMA
-- =====================================================

-- Eliminar tablas si existen (para desarrollo)
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
-- TABLA: products
-- Descripción: Catálogo general de productos
-- =====================================================
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    size VARCHAR(50),
    color VARCHAR(50),
    image_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
-- Contraseña: admin123 (debe ser cambiada)
INSERT INTO users (client_id, user_name, email, password, role) VALUES
(NULL, 'admin_master', 'admin@corporacionargom.com', '$2a$10$placeholder', 'master_admin');

-- Insertar usuarios de clientes
-- Contraseña: password123 (debe ser cambiada)
INSERT INTO users (client_id, user_name, email, password, role) VALUES
(1, 'carnes_doradas', 'carnes@doradas.cr', '$2a$10$placeholder', 'client_user'),
(2, 'wendell_montero', 'wendell@cominsa.cr', '$2a$10$placeholder', 'client_user'),
(3, 'finca_8_del_norte', 'finca8@norte.cr', '$2a$10$placeholder', 'client_user'),
(4, 'francisco_gutierrez', 'francisco@k9intl.cr', '$2a$10$placeholder', 'client_user'),
(4, 'carolina_sibaja', 'carolina@k9intl.cr', '$2a$10$placeholder', 'client_user'),
(4, 'christian_asi', 'christian@k9intl.cr', '$2a$10$placeholder', 'client_user');

-- Insertar productos de ejemplo
INSERT INTO products (sku, name, description, size, color, image_url) VALUES
('PROD001', 'Camisa Polo', 'Camisa polo para uniforme', 'M', 'Rojo', '/images/camisa-roja.jpg'),
('PROD002', 'Pantalón Cargo', 'Pantalón cargo resistente', 'L', 'Negro', '/images/pantalon-negro.jpg'),
('PROD003', 'Gorra Deportiva', 'Gorra con logo bordado', 'Única', 'Azul', '/images/gorra-azul.jpg');

-- Asignar productos a clientes (ejemplo: todos los clientes ven todos los productos)
INSERT INTO client_products (client_id, product_id) VALUES
(1, 1), (1, 2), (1, 3),
(2, 1), (2, 2),
(3, 1), (3, 3),
(4, 1), (4, 2), (4, 3);

-- =====================================================
-- FIN DEL SCHEMA
-- =====================================================
