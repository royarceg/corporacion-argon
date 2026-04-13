"""
expand.py — Convierte imágenes de producto 1024x1024 → canvas 315x420
El producto se escala para caber en el ancho (315px) y se centra verticalmente.
El fondo sobrante se rellena con el color detectado en la esquina de la imagen.

Uso: python3 expand.py
Salida: carpeta ./expanded/
"""

from PIL import Image
import os

CANVAS_W = 315
CANVAS_H = 420
INPUT_DIR  = os.path.join(os.path.dirname(os.path.abspath(__file__)), "nobg")
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "expanded")

os.makedirs(OUTPUT_DIR, exist_ok=True)

files = sorted([
    f for f in os.listdir(INPUT_DIR)
    if f.lower().endswith(".png")
])

print(f"Procesando {len(files)} imágenes → {OUTPUT_DIR}\n")

for i, filename in enumerate(files, 1):
    src = os.path.join(INPUT_DIR, filename)
    dst = os.path.join(OUTPUT_DIR, filename)

    try:
        img = Image.open(src).convert("RGBA")

        # Escalar manteniendo proporción para que quepa en el canvas
        img_ratio    = img.width / img.height
        canvas_ratio = CANVAS_W / CANVAS_H

        if img_ratio > canvas_ratio:
            # Imagen más ancha → limitar por ancho
            new_w = CANVAS_W
            new_h = int(CANVAS_W / img_ratio)
        else:
            # Imagen más alta → limitar por alto
            new_h = CANVAS_H
            new_w = int(CANVAS_H * img_ratio)

        img_scaled = img.resize((new_w, new_h), Image.LANCZOS)

        # Canvas transparente
        canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))

        # Centrar imagen en el canvas
        x = (CANVAS_W - new_w) // 2
        y = (CANVAS_H - new_h) // 2
        canvas.paste(img_scaled, (x, y), img_scaled)

        # Guardar como PNG con transparencia
        canvas.save(dst, "PNG", optimize=True)
        print(f"[{i:>3}/{len(files)}] ✓ {filename}  ({img.size[0]}×{img.size[1]} → {new_w}×{new_h} en canvas {CANVAS_W}×{CANVAS_H})")

    except Exception as e:
        print(f"[{i:>3}/{len(files)}] ✗ {filename}  ERROR: {e}")

print(f"\nListo. {len(files)} imágenes en: {OUTPUT_DIR}")
