"""
upload_nobg.py — Sube imágenes sin fondo (nobg/) a Cloudinary y actualiza la BD.

Carpeta origen : ./nobg/
Cloudinary     : productos/SKU  (primary) | productos/SKU-2  (secondary)
                 Sobreescribe las URLs existentes en la misma carpeta 'productos'.

Convención de nombres:
  SKU.png   → is_primary = true   → Cloudinary public_id: productos/SKU
  SKU.2.png → is_primary = false  → Cloudinary public_id: productos/SKU-2

Actualiza:
  - product_images  (tabla principal)
  - variant_images  (tabla de variantes / colores)

Uso: /tmp/venv-argom/bin/python3 upload_nobg.py
"""

import os
import cloudinary
import cloudinary.uploader
import psycopg2

# ── Cloudinary ───────────────────────────────────────────────────────────────
cloudinary.config(
    cloud_name="dj0i57kxn",
    api_key="248317427133951",
    api_secret="fIPY6XcjQqaoWkOlpkwb09xVt5k",
)

# ── Base de datos ─────────────────────────────────────────────────────────────
conn = psycopg2.connect(
    host="gondola.proxy.rlwy.net",
    port=24536,
    dbname="railway",
    user="postgres",
    password="dRtMUdZXhodgRhxHDtAeoBIHZsuLGiLK",
)
cur = conn.cursor()

# ── Carpeta nobg ──────────────────────────────────────────────────────────────
NOBG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "nobg")

# ── Obtener registros de product_images (con SKU) ─────────────────────────────
cur.execute("""
    SELECT pi.id, p.sku, pi.is_primary, 'product_images' AS tbl
    FROM product_images pi
    JOIN products p ON p.id = pi.product_id
    ORDER BY p.sku, pi.is_primary DESC
""")
pi_rows = cur.fetchall()

# ── Obtener registros de variant_images (con SKU) ─────────────────────────────
cur.execute("""
    SELECT vi.id, p.sku, vi.is_primary, 'variant_images' AS tbl
    FROM variant_images vi
    JOIN products p ON p.id = vi.product_id
    ORDER BY p.sku, vi.is_primary DESC
""")
vi_rows = cur.fetchall()

all_rows = pi_rows + vi_rows
total = len(all_rows)
print(f"Registros en BD: {len(pi_rows)} product_images + {len(vi_rows)} variant_images = {total}\n")

ok = 0
skipped = 0
errors = []

for i, (img_id, sku, is_primary, tbl) in enumerate(all_rows, 1):
    local_filename = f"{sku}.png" if is_primary else f"{sku}.2.png"
    local_path = os.path.join(NOBG_DIR, local_filename)

    # public_id: reemplaza en la misma carpeta 'productos' para no cambiar la estructura
    public_id = f"productos/{sku}" if is_primary else f"productos/{sku}-2"

    if not os.path.exists(local_path):
        print(f"[{i:>4}/{total}] – SKIP (no hay nobg): {local_filename}")
        skipped += 1
        continue

    try:
        result = cloudinary.uploader.upload(
            local_path,
            public_id=public_id,
            overwrite=True,
            resource_type="image",
            format="png",
        )
        new_url = result["secure_url"]

        if tbl == "product_images":
            cur.execute("UPDATE product_images SET image_url = %s WHERE id = %s", (new_url, img_id))
        else:
            cur.execute("UPDATE variant_images SET image_url = %s WHERE id = %s", (new_url, img_id))
        conn.commit()

        print(f"[{i:>4}/{total}] ✓ [{tbl}] {sku} ({'pri' if is_primary else 'sec'}) → OK")
        ok += 1

    except Exception as e:
        conn.rollback()
        msg = f"[{i:>4}/{total}] ✗ [{tbl}] {sku}: {e}"
        print(msg)
        errors.append(msg)

cur.close()
conn.close()

print(f"\n── Resumen ──────────────────────────────")
print(f"  Subidas exitosas : {ok}/{total}")
print(f"  Omitidas (sin nobg): {skipped}")
if errors:
    print(f"  Errores ({len(errors)}):")
    for e in errors:
        print(f"    {e}")
else:
    print("  Sin errores.")
