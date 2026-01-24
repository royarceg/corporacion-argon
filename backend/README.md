# Backend - Corporación Argom

Sistema de gestión de órdenes de compra B2B para Corporación Argom.

## Tecnologías

- Node.js + Express
- PostgreSQL
- JWT para autenticación
- Nodemailer para emails
- PDFKit para generar PDFs

## Requisitos previos

- Node.js v16 o superior
- PostgreSQL v13 o superior
- npm o yarn

## Instalación

1. Instalar dependencias:
```bash
cd backend
npm install
```

2. Crear archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

3. Editar `.env` con tus configuraciones:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=corporacion_argom
DB_USER=postgres
DB_PASSWORD=tu_password
JWT_SECRET=tu_clave_secreta
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_app_password
```

4. Crear la base de datos:
```bash
# Entrar a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE corporacion_argom;

# Salir
\q

# Ejecutar el schema
psql -U postgres -d corporacion_argom -f ../database/schema.sql
```

## Ejecutar el proyecto

### Modo desarrollo (con auto-reload):
```bash
npm run dev
```

### Modo producción:
```bash
npm start
```

El servidor correrá en: `http://localhost:5000`

## Rutas disponibles

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/verify` - Verificar token
- `POST /api/auth/register` - Registrar usuario (solo admin)

### Productos (próximamente)
- `GET /api/products` - Listar productos del cliente
- `GET /api/products/:id` - Ver detalle de producto

### Órdenes (próximamente)
- `POST /api/orders` - Crear orden de compra
- `GET /api/orders` - Listar órdenes
- `GET /api/orders/:id` - Ver detalle de orden
- `PUT /api/orders/:id/confirm` - Confirmar orden (admin)

## Usuarios de prueba

Después de ejecutar el schema, tendrás estos usuarios:

**Admin:**
- Email: admin@corporacionargom.com
- Password: (debes cambiar el hash en la base de datos)

**Clientes:**
- carnes@doradas.cr
- wendell@cominsa.cr
- finca8@norte.cr
- francisco@k9intl.cr

## Estructura del proyecto

```
backend/
├── src/
│   ├── config/         # Configuraciones (DB)
│   ├── controllers/    # Lógica de negocio
│   ├── routes/         # Definición de rutas
│   ├── middleware/     # Middleware (auth, etc)
│   ├── services/       # Servicios externos (email, PDF)
│   └── server.js       # Punto de entrada
├── .env.example        # Variables de entorno ejemplo
├── .gitignore
├── package.json
└── README.md
```

## Troubleshooting

**Error: Cannot connect to database**
- Verifica que PostgreSQL esté corriendo
- Revisa las credenciales en `.env`

**Error: JWT_SECRET is not defined**
- Asegúrate de tener el archivo `.env` configurado

**Error: nodemon not found**
- Instala las dependencias: `npm install`

## Notas importantes

- Cambia el `JWT_SECRET` en producción
- Las contraseñas en el schema son placeholders, debes generar hashes reales
- Configura un app password de Gmail para el envío de emails
