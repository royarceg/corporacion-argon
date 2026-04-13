"""
remove_bg.py — Remueve el fondo de todas las imágenes de producto
Guarda PNG con fondo transparente en ./nobg/

Uso: /tmp/venv-argom/bin/python3 remove_bg.py

Primera ejecución descarga el modelo AI (~170MB), luego corre offline.
"""

from rembg import remove, new_session
from PIL import Image
import os

INPUT_DIR  = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(INPUT_DIR, "nobg")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Ignorar scripts y subcarpetas
SKIP = {"remove_bg.py", "expand.py", "upload_expanded.py"}
SKIP_DIRS = {"nobg", "expanded"}

files = sorted([
    f for f in os.listdir(INPUT_DIR)
    if f.lower().endswith((".png", ".jpg", ".jpeg", ".webp"))
    and f not in SKIP
    and not any(f.startswith(d) for d in SKIP_DIRS)
])

print(f"Cargando modelo AI (primera vez descarga ~170MB)...")
session = new_session("u2net")
print(f"Modelo listo. Procesando {len(files)} imágenes → {OUTPUT_DIR}\n")

for i, filename in enumerate(files, 1):
    src = os.path.join(INPUT_DIR, filename)
    # Siempre guarda como .png para soportar transparencia
    out_name = os.path.splitext(filename)[0] + ".png"
    dst = os.path.join(OUTPUT_DIR, out_name)

    try:
        with open(src, "rb") as f:
            input_data = f.read()

        output_data = remove(input_data, session=session)

        # Verificar que el resultado tiene canal alpha (transparencia)
        from io import BytesIO
        img = Image.open(BytesIO(output_data)).convert("RGBA")
        img.save(dst, "PNG")

        print(f"[{i:>3}/{len(files)}] ✓ {filename} → {out_name}")

    except Exception as e:
        print(f"[{i:>3}/{len(files)}] ✗ {filename}  ERROR: {e}")

print(f"\nListo. Imágenes con fondo transparente en: {OUTPUT_DIR}")
