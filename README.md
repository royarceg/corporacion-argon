# Corporación Argom - Sistema de Órdenes de Compra

Sistema B2B completo para gestión de órdenes de compra con catálogo de productos personalizado por cliente, generación automática de PDFs y notificaciones por email.

## Descripción del Proyecto

Sistema desarrollado para Corporación Argom que permite a sus clientes realizar órdenes de compra de manera digital. Cada cliente tiene acceso a su propio catálogo de productos con precios de referencia basados en su última compra confirmada.

## Características Principales

- Autenticación por usuario y contraseña
- Catálogo de productos personalizado por cliente
- Precios de referencia basados en última compra
- Carrito de compras
- Generación automática de órdenes
- Notificaciones por email (Order Acknowledgement y Order Confirmation)
- Dashboard administrativo para confirmar órdenes
- Gestión de usuarios y productos

## Tecnologías Utilizadas

### Backend
- Node.js + Express
- PostgreSQL
- JWT para autenticación
- Nodemailer para emails
- PDFKit para generar PDFs
- bcryptjs para encriptación

### Frontend
- React 18
- React Router v6
- Axios
- Tailwind CSS

### Hosting
- Railway (Backend + Base de Datos + Frontend)

## Estructura del Proyecto

```
corporacion-argom/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   ├── package.json
│   └── README.md
├── database/
│   └── schema.sql
└── README.md
```

## Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd corporacion-argom
```

### 2. Configurar Base de Datos

```bash
# Crear base de datos en PostgreSQL
psql -U postgres
CREATE DATABASE corporacion_argom;
\q

# Ejecutar schema
psql -U postgres -d corporacion_argom -f database/schema.sql
```

### 3. Configurar Backend

```bash
cd backend
npm install

# Crear archivo .env
cp .env.example .env

# Editar .env con tus credenciales
```

### 4. Configurar Frontend

```bash
cd frontend
npm install

# Crear archivo .env
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
```

### 5. Ejecutar el Proyecto

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

## Usuarios de Prueba

### Clientes

| Cliente | Usuario | Empresa |
|---------|---------|---------|
| Cliente 1 | carnes_doradas | Carnes Doradas de Costa Rica S.A. |
| Cliente 2 | wendell_montero | COMINSA S.A. |
| Cliente 3 | finca_8_del_norte | Finca 8 del Norte S.A. |
| Cliente 4 | francisco_gutierrez | K-9 Internacional S.A. |
| Cliente 4 | carolina_sibaja | K-9 Internacional S.A. |
| Cliente 4 | christian_asi | K-9 Internacional S.A. |

### Administrador
- Usuario: admin_master
- Contraseña: (debe configurarse con hash bcrypt)

## Flujo de Trabajo

### Para Clientes

1. Inicia sesión con su usuario
2. Navega al catálogo de productos
3. Agrega productos al carrito
4. Procede a crear la orden ingresando:
   - PO del cliente
   - Fecha deseada de entrega (opcional)
5. Confirma la orden
6. Recibe email "Order Acknowledgement"
7. Espera confirmación del administrador
8. Recibe email "Order Confirmation" con precios y cantidades finales

### Para Administrador

1. Inicia sesión con credenciales de admin
2. Ve dashboard con todas las órdenes pendientes
3. Abre orden pendiente
4. Modifica cantidades y precios según disponibilidad
5. Confirma la orden
6. Sistema envía email de confirmación al cliente
7. Actualiza precios de referencia del cliente

## Variables de Entorno

### Backend (.env)

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=corporacion_argom
DB_USER=postgres
DB_PASSWORD=tu_password
PORT=5000
NODE_ENV=development
JWT_SECRET=tu_clave_secreta_super_segura
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_app_password
EMAIL_FROM=noreply@corporacionargom.com
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)

```
REACT_APP_API_URL=http://localhost:5000/api
```

## Despliegue en Railway

1. Crear cuenta en Railway
2. Crear nuevo proyecto
3. Agregar servicio PostgreSQL
4. Agregar servicio para Backend (Node.js)
5. Agregar servicio para Frontend (React)
6. Configurar variables de entorno en cada servicio
7. Conectar repositorio GitHub
8. Railway desplegará automáticamente

## Próximas Características

- Gestión completa de usuarios desde admin
- Gestión de productos desde admin
- Reportes y estadísticas
- Historial de cambios de precios
- Múltiples métodos de pago
- Notificaciones en tiempo real
- Adjuntar PDFs a los emails
- Sistema de comentarios en órdenes

## Soporte

Para problemas o preguntas, contactar al administrador del sistema.

## Licencia

Propiedad de Corporación Argom
