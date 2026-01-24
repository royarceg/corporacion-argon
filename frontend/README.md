# Frontend - Corporación Argom

Aplicación web para el sistema de órdenes de compra B2B.

## Tecnologías

- React 18
- React Router v6
- Axios
- Tailwind CSS

## Requisitos previos

- Node.js v16 o superior
- npm o yarn

## Instalación

1. Instalar dependencias:
```bash
cd frontend
npm install
```

2. Crear archivo `.env` en la raíz de frontend:
```bash
REACT_APP_API_URL=http://localhost:5000/api
```

## Ejecutar el proyecto

### Modo desarrollo:
```bash
npm start
```

La aplicación correrá en: `http://localhost:3000`

### Build para producción:
```bash
npm run build
```

## Estructura del proyecto

```
frontend/
├── public/
│   ├── index.html
│   └── assets/
│       └── images/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── ProductCard.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── ProductCatalog.jsx
│   │   ├── Checkout.jsx
│   │   ├── OrderHistory.jsx
│   │   ├── OrderDetail.jsx
│   │   └── AdminDashboard.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── productService.js
│   │   └── orderService.js
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── App.jsx
│   ├── index.js
│   └── index.css
├── package.json
├── tailwind.config.js
└── README.md
```

## Usuarios de prueba

**Admin:**
- Usuario: admin_master
- Contraseña: (configurar después de generar hash)

**Clientes:**
- carnes_doradas
- wendell_montero
- finca_8_del_norte
- francisco_gutierrez
- carolina_sibaja
- christian_asi

## Rutas disponibles

### Rutas públicas
- `/login` - Inicio de sesión

### Rutas de clientes
- `/productos` - Catálogo de productos
- `/checkout` - Finalizar orden
- `/ordenes` - Historial de órdenes
- `/ordenes/:id` - Detalle de orden

### Rutas de administrador
- `/admin` - Dashboard administrativo
- `/admin/ordenes` - Gestión de órdenes (próximamente)
- `/admin/usuarios` - Gestión de usuarios (próximamente)

## Características

- Autenticación con JWT
- Rutas protegidas por rol
- Catálogo de productos con precios de referencia
- Carrito de compras
- Creación de órdenes
- Historial de órdenes
- Dashboard administrativo

## Notas

- Los tokens expiran en 24 horas
- La sesión se guarda en localStorage
- Los precios mostrados son de referencia
- El precio final es confirmado por el administrador
