// ESTE ARCHIVO CONTIENE LA FUNCIÓN deleteProduct
// Copiar el contenido y renombrarlo a productController.js

// Al final del archivo, antes del module.exports, agregar:

// =====================================================
// DELETE PRODUCT (ADMIN) - Eliminar producto
// =====================================================
const deleteProduct = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;

    console.log('=== ELIMINANDO PRODUCTO ===');
    console.log('ID:', id);

    await client.query('BEGIN');

    // 1. Verificar que el producto existe
    const productCheck = await client.query(
      'SELECT id FROM products WHERE id = $1',
      [id]
    );

    if (productCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        error: 'Producto no encontrado' 
      });
    }

    // 2. Eliminar en orden (las tablas con CASCADE lo harán automáticamente)
    // Pero es buena práctica hacerlo explícitamente
    
    // Eliminar variantes
    await client.query('DELETE FROM product_variants WHERE product_id = $1', [id]);
    
    // Eliminar imágenes
    await client.query('DELETE FROM product_images WHERE product_id = $1', [id]);
    await client.query('DELETE FROM variant_images WHERE product_id = $1', [id]);
    
    // Eliminar videos
    await client.query('DELETE FROM product_videos WHERE product_id = $1', [id]);
    await client.query('DELETE FROM variant_videos WHERE product_id = $1', [id]);
    
    // Eliminar asignaciones a clientes
    await client.query('DELETE FROM client_products WHERE product_id = $1', [id]);
    
    // Eliminar precios personalizados
    await client.query('DELETE FROM client_product_prices WHERE product_id = $1', [id]);
    
    // Finalmente, eliminar el producto
    await client.query('DELETE FROM products WHERE id = $1', [id]);

    await client.query('COMMIT');

    console.log('Producto eliminado exitosamente');

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en deleteProduct:', error);
    res.status(500).json({ 
      error: 'Error al eliminar producto' 
    });
  } finally {
    client.release();
  }
};

// Y cambiar el module.exports a:
module.exports = {
  getProducts,
  getProductById,
  getProductByIdAdmin,
  getAllProducts,
  getProductsByCategory,
  updateProduct,
  createProduct,
  searchProducts,
  deleteProduct  // AGREGAR ESTA LÍNEA
};
