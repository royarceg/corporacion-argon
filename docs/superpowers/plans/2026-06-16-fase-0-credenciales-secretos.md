# Fase 0 — Credenciales y Secretos · Plan de Implementación

> **Para ejecución:** Este plan se ejecuta con superpowers (executing-plans / subagent-driven-development). Los pasos usan checkbox (`- [ ]`). La Fase 0 es de seguridad/operaciones (no lógica de app), así que en vez de TDD usamos **comandos de verificación** como prueba de cada paso.

**Objetivo:** Neutralizar las credenciales expuestas (PostgreSQL producción, Cloudinary, GitHub PAT) y sacar del repo público los archivos sensibles y las herramientas servidas por error.

**Arquitectura:** Dos frentes. (1) **Rotación** de credenciales — acciones de Gustavo en GitHub/Railway/Cloudinary, porque son sus cuentas. (2) **Limpieza del repo** — yo saco secretos de los archivos, reubico las herramientas fuera de `public/`, arreglo `.gitignore` y el remote, y opcionalmente purgo el historial.

**Realidad crítica:** El repo es **público en GitHub** y los secretos ya fueron pusheados. Por eso **la rotación es obligatoria** — limpiar el historial ayuda a la higiene pero NO desactiva un secreto ya expuesto. Lo que lo desactiva es rotarlo.

---

## Resumen de secretos expuestos (confirmado leyendo el código)

| Secreto | Valor (parcial) | Dónde | Acción |
|---------|-----------------|-------|--------|
| 🔴 Password PostgreSQL producción | `dRtMU…GiLK` (host `gondola.proxy.rlwy.net:24536`) | `upload_nobg.py`, `upload_expanded.py` | Rotar en Railway |
| 🔴 Cloudinary api_secret | `fIPY6…t5k` | mismos 2 archivos | Rotar en Cloudinary |
| 🔴 GitHub PAT | `github_pat_11CB4ZB…` | `.git/config` (remote) | Revocar en GitHub |
| 🟠 Excel inventario | `Productos Catalogo Inventario.xlsx` | `web/public/images/ai-originals/` | Sacar de `public/` y de git |

---

## PARTE A — Acciones de Gustavo (rotación) · BLOQUEAN el resto

> Estas las hacés vos (son tus cuentas). Avisame cuando estén listas. **A2 es la más urgente** — da acceso directo a la base de datos de producción.

- [ ] **A1: Revocar el GitHub PAT**
  GitHub → Settings → Developer settings → Personal access tokens → encontrar el token activo → **Revoke**.

- [ ] **A2: Rotar la contraseña de PostgreSQL (Railway)**
  Railway → proyecto → servicio Postgres → pestaña Variables/Settings → regenerar credenciales (o cambiar `POSTGRES_PASSWORD`).
  Actualizar `DATABASE_URL` en el servicio del **backend** con la nueva cadena.
  Verificar que el backend siga conectando (Railway redeploy → logs muestran "Conectado a PostgreSQL").

- [ ] **A3: Rotar el Cloudinary api_secret**
  Cloudinary → Settings → Security/API Keys → **regenerar API Secret**.
  Actualizar `CLOUDINARY_API_SECRET` en el servicio del **backend** en Railway.

---

## PARTE B — Limpieza del repo (mis acciones, requieren tu OK)

### Task B1: Quitar el PAT del remote de git

**Files:**
- Modify: `.git/config` (vía comando `git remote set-url`)

- [ ] **Step 1: Reapuntar el remote sin credencial incrustada**
```bash
git remote set-url origin https://github.com/royarceg/corporacion-argon.git
```

- [ ] **Step 2: Verificar que ya no hay token en el remote**
```bash
git remote -v
```
Esperado: las URLs muestran `https://github.com/royarceg/corporacion-argon.git` SIN `github_pat_…`.

> Nota: para futuros push, autenticar con el `gh` CLI o un credential helper. Si el push pide credenciales, lo coordinamos.

---

### Task B2: Reubicar las 4 herramientas Python fuera de `public/` y sacarles los secretos

Las 4 viven en `web/public/products/` (servidas a internet). Las movemos a `web/scripts/product-images/` (no servida). A los 2 `upload_*.py` les cambiamos los secretos por variables de entorno.

**Files:**
- Create dir: `web/scripts/product-images/`
- Move: `web/public/products/{expand.py, remove_bg.py, upload_expanded.py, upload_nobg.py}` → `web/scripts/product-images/`
- Modify: `upload_nobg.py` y `upload_expanded.py` (bloques de credenciales)

- [ ] **Step 1: Crear carpeta y mover los 4 scripts (preservando historial)**
```bash
mkdir -p web/scripts/product-images
git mv web/public/products/expand.py        web/scripts/product-images/expand.py
git mv web/public/products/remove_bg.py     web/scripts/product-images/remove_bg.py
git mv web/public/products/upload_expanded.py web/scripts/product-images/upload_expanded.py
git mv web/public/products/upload_nobg.py     web/scripts/product-images/upload_nobg.py
```

- [ ] **Step 2: En `upload_nobg.py` y `upload_expanded.py`, reemplazar el bloque de credenciales**

Reemplazar este bloque (idéntico en ambos archivos):
```python
cloudinary.config(
    cloud_name="dj0i57kxn",
    api_key="248317427133951",
    api_secret="<CLOUDINARY_SECRET_REDACTADO>",
)

# ── Base de datos ─...
conn = psycopg2.connect(
    host="gondola.proxy.rlwy.net",
    port=24536,
    dbname="railway",
    user="postgres",
    password="<DB_PASSWORD_VIEJA_REDACTADA>",
)
```
por:
```python
cloudinary.config(
    cloud_name=os.environ["CLOUDINARY_CLOUD_NAME"],
    api_key=os.environ["CLOUDINARY_API_KEY"],
    api_secret=os.environ["CLOUDINARY_API_SECRET"],
)

# ── Base de datos ─...
# Lee DATABASE_URL del entorno (misma que usa el backend). Ej:
#   export DATABASE_URL="postgresql://postgres:PASS@host:port/railway"
conn = psycopg2.connect(os.environ["DATABASE_URL"])
```
(El `import os` ya existe al inicio de ambos archivos.)

- [ ] **Step 3: Que las rutas a las carpetas de imágenes sigan funcionando tras el move**
En ambos `upload_*.py`, las carpetas de origen (`nobg/`, `expanded/`) se calculan relativas al script. Confirmar que apunten a donde están las imágenes. Si las imágenes siguen en `web/public/products/nobg|expanded` (gitignoreadas, locales), parametrizar con un default:
```python
BASE_DIR = os.environ.get("PRODUCT_IMAGES_DIR",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "public", "products"))
NOBG_DIR = os.path.join(BASE_DIR, "nobg")          # en upload_nobg.py
EXPANDED_DIR = os.path.join(BASE_DIR, "expanded")  # en upload_expanded.py
```
(Ajustar `remove_bg.py` y `expand.py` igual si hace falta — esos no tienen secretos, solo rutas.)

- [ ] **Step 4: Verificar que NO queda ningún secreto en los archivos movidos**
```bash
grep -rniE "dRtMU|fIPY6|gondola.proxy.rlwy.net|248317427133951|api_secret=\"" web/scripts/product-images/
```
Esperado: **sin resultados** (vacío).

- [ ] **Step 5: Verificar que ya no hay `.py` servidos en public/**
```bash
ls web/public/products/*.py 2>/dev/null || echo "OK: no quedan .py en public/products"
```
Esperado: `OK: no quedan .py en public/products`.

---

### Task B3: Sacar el Excel de inventario de `public/` y de git

**Files:**
- Untrack + move: `web/public/images/ai-originals/Productos Catalogo Inventario.xlsx`

- [ ] **Step 1: Mover el xlsx fuera del árbol servido y fuera de git**
```bash
mkdir -p data/inventario-privado
git mv "web/public/images/ai-originals/Productos Catalogo Inventario.xlsx" \
       "data/inventario-privado/Productos Catalogo Inventario.xlsx"
```
(Lo dejamos en `data/`, que NO se sirve. En el Step de .gitignore lo sacamos también de tracking.)

- [ ] **Step 2: Verificar que ya no está bajo public/**
```bash
git ls-files "web/public/" | grep -i "\.xlsx" || echo "OK: ningun xlsx en public/"
```
Esperado: `OK: ningun xlsx en public/`.

---

### Task B4: Arreglar `.gitignore` (raíz + web)

**Files:**
- Modify: `.gitignore` (raíz)
- Modify: `web/.gitignore`

- [ ] **Step 1: Añadir reglas al `.gitignore` raíz**
Agregar al final:
```gitignore
# Exports de datos y archivos comprimidos (no versionar)
*.xlsx
*.zip
data/inventario-privado/

# Artefactos de tooling local
web/src/.agents/
web/src/skills-lock.json
```

- [ ] **Step 2: Añadir reglas al `web/.gitignore`**
Agregar:
```gitignore
# Herramientas de procesamiento de imágenes (locales, no servir)
# (las imágenes nobg/expanded ya están ignoradas arriba)
.agents/
skills-lock.json
```

- [ ] **Step 3: Sacar de tracking el xlsx ya movido (si git lo sigue rastreando)**
```bash
git rm --cached "data/inventario-privado/Productos Catalogo Inventario.xlsx" 2>/dev/null || true
```

- [ ] **Step 4: Verificar que los artefactos sueltos no van a entrar**
```bash
git check-ignore -v web/src/.agents web/src/skills-lock.json data/inventario-privado/*.xlsx 2>/dev/null
git status --porcelain | grep -iE "\.zip|\.xlsx|\.agents|skills-lock" || echo "OK: nada sensible en staging/untracked"
```
Esperado: las rutas aparecen como ignoradas; el segundo comando imprime `OK`.

---

### Task B5: Eliminar los .zip sueltos del working tree

**Files:**
- Delete (untracked): `OnlineWebFonts_COM_bcc03362a51586714ff2874532c788c0.zip`, `geograph.zip`, `web/argon_database_export.xlsx`, `web/~$argon_database_export.xlsx`

- [ ] **Step 1: Confirmar que son untracked antes de borrar (no perder nada versionado)**
```bash
git status --porcelain OnlineWebFonts_COM_*.zip geograph.zip web/argon_database_export.xlsx
```
Esperado: cada línea empieza con `??` (untracked). Si alguno NO es `??`, parar y revisar.

- [ ] **Step 2: Borrar los zips y el xlsx suelto (son untracked, no afectan git)**
```bash
rm -f OnlineWebFonts_COM_bcc03362a51586714ff2874532c788c0.zip geograph.zip \
      web/argon_database_export.xlsx "web/~\$argon_database_export.xlsx"
```
(Si las fuentes del zip se usan en el sitio, primero las extraés a donde corresponda; confirmamos antes de borrar.)

---

### Task B6: Barrido final de secretos en TODO lo trackeado + commit

- [ ] **Step 1: Barrido final — no debe quedar ningún secreto real versionado**
```bash
git grep -niE "dRtMU|fIPY6|gondola\.proxy\.rlwy\.net|248317427133951|github_pat_" -- . ':!*.md' || echo "OK: sin secretos en tracked"
```
Esperado: `OK: sin secretos en tracked` (los README con `tu_password` son placeholders y están excluidos por ser ejemplos).

- [ ] **Step 2: Commit de la limpieza**
```bash
git add -A
git commit -m "security: sacar secretos y herramientas de public/, mover xlsx privado, endurecer .gitignore"
```

---

## PARTE C — Purga del historial (DESTRUCTIVO · requiere tu OK explícito)

> ⚠️ Esto reescribe el historial de git y necesita un **force-push** a un repo **público compartido**. Es difícil de revertir y afecta a cualquiera que tenga un clon. **NO lo ejecuto sin tu confirmación explícita.** Recordá: como el repo ya es público y vamos a rotar todo, la purga es **higiene**, no la defensa principal (la defensa es la rotación de la Parte A).

### Task C1: Purgar secretos y archivos sensibles de todo el historial

**Herramienta:** `git filter-repo` (recomendado) o BFG.

- [ ] **Step 1: Backup completo del repo antes de tocar el historial**
```bash
cd .. && cp -R Corporacion_ARGOM Corporacion_ARGOM_BACKUP_$(date +%Y%m%d) && cd Corporacion_ARGOM
```

- [ ] **Step 2: Crear archivo de reemplazos y purgar por contenido**
```bash
cat > /tmp/secrets-replace.txt <<'EOF'
<DB_PASSWORD_VIEJA_REDACTADA>==>REDACTED
<CLOUDINARY_SECRET_REDACTADO>==>REDACTED
EOF
git filter-repo --replace-text /tmp/secrets-replace.txt --force
```

- [ ] **Step 3: Purgar los archivos sensibles de todo el historial**
```bash
git filter-repo --invert-paths \
  --path "web/public/products/upload_nobg.py" \
  --path "web/public/products/upload_expanded.py" \
  --path "web/public/images/ai-originals/Productos Catalogo Inventario.xlsx" \
  --force
```

- [ ] **Step 4: Reconfigurar el remote (filter-repo lo elimina) y force-push**
```bash
git remote add origin https://github.com/royarceg/corporacion-argon.git
git push origin --force --all
```
Esperado: push exitoso. **Antes de esto te pido confirmación final.**

- [ ] **Step 5: Verificar que el secreto ya no está en el historial**
```bash
git log --all -p | grep -c "<DB_PASSWORD_VIEJA_REDACTADA>" || echo "OK: 0 ocurrencias en historial"
```
Esperado: `OK: 0 ocurrencias en historial`.

---

## Verificación final de la Fase 0

- [ ] El backend conecta a la DB con la nueva contraseña (Railway logs).
- [ ] El sitio devuelve 404 en `/products/upload_nobg.py` (ya no servido).
- [ ] `git grep` de los secretos en tracked → vacío.
- [ ] `git remote -v` sin PAT.
- [ ] Las 3 credenciales rotadas (PAT, Postgres, Cloudinary).

---

## Pendiente para fases siguientes (no Fase 0)
- `.env.example` del backend documenta `DB_*` discretas pero el código usa `DATABASE_URL` → reconciliar en Fase 6.
- Lockfiles ignorados → commitear en Fase 5/6.
- Typo ARGOM→ARGON → Fase 6.
