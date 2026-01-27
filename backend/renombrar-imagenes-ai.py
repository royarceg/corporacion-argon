import os
import shutil

# Ruta de la carpeta
folder_path = '/Users/gustavocerdascampos/Downloads/Proyectos/Proyectos en Proceso/Corporacion_ARGOM/00. Multimedia/Imagenes-K9/AI'

# Orden de productos (cada uno tiene 2 imágenes)
productos_orden = [
    'ABR-01',
    'AIS-01',
    'BJK-01',
    'BOT-03',
    'BUJ-XRE300',
    'BUL-04',
    'BUL-05',
    'BUL-06',
    'CAD-SPRO',
    'CAD-XR250',
    'CAJ-01',
    'CAP-01',
    'CAP-02',
    'CAS-01',
    'CCC-XR250',
    'CDP-520',
    'CHA-01',
    'CHT-01',
    'CHT-02',
    'COL-01',
    'COL-02',
    'COR-01',
    'CUG-01',
    'CUG-02',
    'DFD-XRE300',
    'DFT-XRE300',
    'DOM-02',
    'ESR-01',
    'ESV-XRE300',
    'FAJ-03B',
    'FAJ-03N',
    'FAR-01',
    'FFT-XRE-300',
    'FOC-01',
    'FOC-02',
    'GOC-01',
    'GOR-01',
    'GOR-02',
    'GUA-01',
    'GUT-01'
]

# Listar todas las imágenes
archivos = sorted([f for f in os.listdir(folder_path) if f.endswith('.png')])

# Filtrar solo las que NO están ya renombradas (las que tienen nombres largos de Ideogram)
imagenes_pendientes = [f for f in archivos if f.startswith('00')]

print(f"📊 Total de archivos: {len(archivos)}")
print(f"✅ Ya renombrados: {len(archivos) - len(imagenes_pendientes)}")
print(f"⏳ Pendientes de renombrar: {len(imagenes_pendientes)}\n")

if len(imagenes_pendientes) == 0:
    print("✅ ¡Todas las imágenes ya están renombradas!")
else:
    print("🔄 RENOMBRANDO IMÁGENES:\n")
    print("="*60)
    
    # Agrupar las imágenes pendientes por número (cada producto tiene _1 y _2)
    # Ejemplo: 0002_1_... y 0002_2_... son las 2 imágenes del primer producto pendiente
    
    imagenes_agrupadas = {}
    for img in imagenes_pendientes:
        # Extraer el número (ejemplo: 0002 de "0002_1_product...")
        numero = img.split('_')[0]
        if numero not in imagenes_agrupadas:
            imagenes_agrupadas[numero] = []
        imagenes_agrupadas[numero].append(img)
    
    # Ordenar por número
    numeros_ordenados = sorted(imagenes_agrupadas.keys())
    
    # Calcular desde qué producto empezar
    # Si ABR-01 ya está renombrado, empezamos desde el siguiente
    ya_renombrados = [f for f in archivos if not f.startswith('00')]
    
    # Contar cuántos productos ya están renombrados
    codigos_renombrados = set()
    for f in ya_renombrados:
        # Extraer código (ejemplo: ABR-01 de "ABR-01.png" o "ABR-01.2.png")
        if '.2.' in f or f.endswith('.2.png'):
            codigo = f.replace('.2.png', '')
        else:
            codigo = f.replace('.png', '')
        codigos_renombrados.add(codigo)
    
    productos_ya_renombrados = len(codigos_renombrados)
    
    print(f"📍 Productos ya renombrados: {productos_ya_renombrados}")
    print(f"📍 Empezando desde: {productos_orden[productos_ya_renombrados]}\n")
    
    # Renombrar
    indice_producto = productos_ya_renombrados
    
    for numero in numeros_ordenados:
        if indice_producto >= len(productos_orden):
            print("⚠️  Se acabaron los códigos del orden proporcionado")
            break
            
        imagenes = sorted(imagenes_agrupadas[numero])
        codigo_producto = productos_orden[indice_producto]
        
        print(f"\n🔸 Producto: {codigo_producto}")
        
        for i, img_actual in enumerate(imagenes, 1):
            # Nuevo nombre
            if i == 1:
                nuevo_nombre = f"{codigo_producto}.png"
            else:
                nuevo_nombre = f"{codigo_producto}.{i}.png"
            
            # Rutas completas
            ruta_actual = os.path.join(folder_path, img_actual)
            ruta_nueva = os.path.join(folder_path, nuevo_nombre)
            
            # Renombrar
            os.rename(ruta_actual, ruta_nueva)
            
            print(f"   ✅ {img_actual[:50]}... → {nuevo_nombre}")
        
        indice_producto += 1
    
    print("\n" + "="*60)
    print("✅ RENOMBRADO COMPLETADO")
    print(f"📊 Total de productos renombrados: {indice_producto - productos_ya_renombrados}")
