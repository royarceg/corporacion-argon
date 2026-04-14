"""
upload_expanded.py — Sube imágenes expandidas a Cloudinary y actualiza la BD
Carpeta origen: ./expanded/
Carpeta Cloudinary destino: productos-expanded/

Convención de nombres:
  BD is_primary=true  → expanded/SKU.png    → Cloudinary: productos-expanded/SKU
  BD is_primary=false → expanded/SKU.2.png  → Cloudinary: productos-expanded/SKU-2

Uso: /tmp/venv-argom/bin/python3 upload_expanded.py
"""

import os
import cloudinary
import cloudinary.uploader
import psycopg2

# ── Cloudinary ──────────────────────────────────────────────────────────────
cloudinary.config(
    cloud_name="dj0i57kxn",
    api_key="248317427133951",
    api_secret="fIPY6XcjQqaoWkOlpkwb09xVt5k",
)

# ── Base de datos ────────────────────────────────────────────────────────────
conn = psycopg2.connect(
    host="gondola.proxy.rlwy.net",
    port=24536,
    dbname="railway",
    user="postgres",
    password="dRtMUdZXhodgRhxHDtAeoBIHZsuLGiLK",
)
cur = conn.cursor()

# ── Carpeta de imágenes expandidas ───────────────────────────────────────────
EXPANDED_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "expanded")

# ── Obtener todos los registros de imágenes ──────────────────────────────────
cur.execute("""
    SELECT pi.id, p.sku, pi.is_primary
    FROM product_images pi
    JOIN products p ON p.id = pi.product_id
    ORDER BY p.sku, pi.is_primary DESC
""")
rows = cur.fetchall()
total = len(rows)
print(f"Registros en BD: {total}\n")

ok = 0
errors = []

for i, (img_id, sku, is_primary) in enumerate(rows, 1):
    # Archivo local: SKU.png (primary) o SKU.2.png (secondary)
    local_filename = f"{sku}.png" if is_primary else f"{sku}.2.png"
    local_path = os.path.join(EXPANDED_DIR, local_filename)

    # public_id en Cloudinary: productos-expanded/SKU o productos-expanded/SKU-2
    public_id = f"productos-expanded/{sku}" if is_primary else f"productos-expanded/{sku}-2"

    if not os.path.exists(local_path):
        msg = f"[{i:>3}/{total}] ✗ ARCHIVO NO ENCONTRADO: {local_filename}"
        print(msg)
        errors.append(msg)
        continue

    try:
        result = cloudinary.uploader.upload(
            local_path,
            public_id=public_id,
            overwrite=True,
            resource_type="image",
        )
        new_url = result["secure_url"]

        # Actualizar BD
        cur.execute("UPDATE product_images SET image_url = %s WHERE id = %s", (new_url, img_id))
        conn.commit()

        print(f"[{i:>3}/{total}] ✓ {sku} ({'primary' if is_primary else 'secondary'}) → {new_url}")
        ok += 1

    except Exception as e:
        conn.rollback()
        msg = f"[{i:>3}/{total}] ✗ {sku} ERROR: {e}"
        print(msg)
        errors.append(msg)

cur.close()
conn.close()

print(f"\n── Resumen ──────────────────────")
print(f"  Subidas exitosas: {ok}/{total}")
if errors:
    print(f"  Errores ({len(errors)}):")
    for e in errors:
        print(f"    {e}")
else:
    print("  Sin errores.")
