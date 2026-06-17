# Corporación Argon — Sistema de Órdenes de Compra

Sistema B2B para gestión de órdenes de compra con catálogo de productos personalizado por cliente y notificaciones por email.

## Descripción

Plataforma para que los clientes de Corporación Argon realicen órdenes de compra de forma digital. Cada cliente ve su propio catálogo con precios de referencia basados en su última compra confirmada; un administrador revisa y confirma las órdenes.

## Características

- Autenticación con JWT guardado en **cookie httpOnly** (no expuesto a JavaScript)
- Catálogo de productos personalizado por cliente
- Precios de referencia basados en la última compra confirmada
- Carrito de compras y wishlist
- Generación de órdenes + emails (Acknowledgement / Confirmation) vía Resend
- Exportación de órdenes a PDF y Excel (desde el panel admin)
- Panel administrativo: confirmar órdenes, gestionar usuarios y productos
- Búsqueda fuzzy y solicitudes de productos

## Stack

**Backend** — Node.js + Express · PostgreSQL (`pg`) · JWT (cookie httpOnly) · bcryptjs · Resend (email vía API HTTP) · Cloudinary (imágenes/videos) · ExcelJS · Jest (tests)

**Frontend** — Next.js 16 (App Router) · React 19 · Axios (`withCredentials`) · Tailwind CSS v4 · anime.js · Jest + React Testing Library

**Hosting** — Backend + PostgreSQL en **Railway** (`api.corporacionargon.com`) · Frontend en **Vercel** (`corporacionargon.com`)

## Estructura

```
.
├── backend/            # API Express
│   ├── src/
│   │   ├── config/         # database, cloudinary
│   │   ├── controllers/
│   │   ├── middleware/     # auth, validators, errorHandler
│   │   ├── routes/
│   │   ├── services/       # emailService (Resend), fuzzySearch
│   │   ├── utils/
│   │   └── server.js
│   ├── __tests__/          # Jest
│   └── .env.example
├── web/                # Frontend Next.js (App Router)
│   ├── src/
│   │   ├── app/            # rutas
│   │   ├── components/
│   │   ├── context/        # Auth, Cart, Wishlist
│   │   ├── hooks/
│   │   ├── services/       # clientes axios por dominio
│   │   └── __tests__/      # Jest + RTL
│   └── .env.example
├── database/
│   └── schema.sql          # generado desde la DB de producción (pg_dump --schema-only)
└── README.md
```

## Desarrollo local

### Backend
```bash
cd backend
npm install
cp .env.example .env        # completar DATABASE_URL, JWT_SECRET, RESEND_API_KEY, CLOUDINARY_*, etc.
npm run dev                 # nodemon
npm test                    # Jest
```

### Frontend
```bash
cd web
npm install
cp .env.example .env.local  # NEXT_PUBLIC_API_URL
npm run dev                 # http://localhost:3002
npm test                    # Jest + RTL
```

## Variables de entorno

Ver `backend/.env.example` y `web/.env.example` (documentan las variables que el código realmente usa). El backend se conecta con **`DATABASE_URL`** y envía emails con **Resend** (`RESEND_API_KEY`).

## Flujo de trabajo

**Cliente:** inicia sesión → navega el catálogo → agrega al carrito → crea la orden (PO + fecha deseada) → recibe email de acuse → espera confirmación → recibe email de confirmación con precios/cantidades finales.

**Administrador:** revisa órdenes pendientes → ajusta cantidades y precios → confirma → el sistema envía el email de confirmación y actualiza los precios de referencia del cliente.

## Despliegue

- **Backend + PostgreSQL:** Railway (deploy automático desde `main`; dominio custom `api.corporacionargon.com`).
- **Frontend:** Vercel (deploy automático desde `main`; dominio `corporacionargon.com`).

## Licencia

Propiedad de Corporación Argon.
