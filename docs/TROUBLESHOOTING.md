# 🔧 TROUBLESHOOTING - Productos No Cargan

## Problema Identificado
Los productos se quedan en "Cargando producto..." infinitamente.

## Pasos para Diagnosticar

### 1. Verificar que el Backend esté corriendo
```bash
cd backend
npm start
```

**Debe mostrar:**
```
✅ Servidor corriendo en puerto 5000
✅ Base de datos conectada
```

### 2. Verificar la Consola del Navegador
1. Abre las DevTools (F12 o Cmd+Option+I)
2. Ve a la pestaña "Console"
3. Busca errores en rojo
4. Busca mensajes que digan:
   - `Failed to fetch`
   - `Network error`
   - `CORS error`
   - `404 Not Found`
   - `500 Internal Server Error`

**¿Qué errores ves?** Anota los mensajes completos.

### 3. Verificar la pestaña Network
1. En DevTools, ve a "Network"
2. Recarga la página
3. Busca la petición que dice `/api/products/79` (o el ID que estés viendo)
4. Haz click en ella
5. Ve a la pestaña "Response"

**¿Qué responde el servidor?**
- ✅ Si ves JSON con datos del producto → Backend funciona, problema en frontend
- ❌ Si ves error 404 → El producto no existe o no está asignado al cliente
- ❌ Si ves error 500 → Error en el servidor
- ❌ Si no ves nada o timeout → Backend no está corriendo

### 4. Verificar Variables de Entorno
Revisa el archivo `frontend/.env`:

```bash
# Debe tener algo como:
REACT_APP_API_URL=http://localhost:5000/api
```

Si no existe, créalo con ese contenido.

### 5. Verificar el Archivo de Configuración de la API
Revisa `frontend/src/services/api.js` o donde esté configurado axios:

```javascript
// Debe apuntar a:
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

### 6. Verificar que el Usuario Esté Autenticado
En la consola del navegador:
```javascript
console.log(localStorage.getItem('token'));
```

Si devuelve `null`, necesitas iniciar sesión de nuevo.

### 7. Verificar que el Producto Esté Asignado al Cliente
En la base de datos, ejecuta:
```sql
-- Ver si el producto 79 existe
SELECT * FROM products WHERE id = 79;

-- Ver si está asignado al cliente actual
SELECT * FROM client_products 
WHERE product_id = 79 AND active = true;
```

## Soluciones Comunes

### A. Backend No Está Corriendo
```bash
cd backend
npm start
```

### B. Puerto Incorrecto
Verifica en `backend/server.js`:
```javascript
const PORT = process.env.PORT || 5000;
```

Y en `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### C. Error de CORS
En `backend/server.js`, verifica que tenga:
```javascript
const cors = require('cors');
app.use(cors());
```

### D. Token Expirado
Cierra sesión y vuelve a iniciar sesión.

### E. Base de Datos No Conectada
Verifica las credenciales en `backend/.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=argom_db
DB_USER=postgres
DB_PASSWORD=tu_password
```

## Siguiente Paso

Por favor ejecuta estos diagnósticos y dime:
1. ¿Qué errores ves en la consola?
2. ¿Qué responde la petición en Network?
3. ¿El backend está corriendo?

Con esa información podré ayudarte a resolver el problema específico.
