import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import ProductEditModal from '../components/ProductEditModal';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productService.getAllProducts();
      setProducts(response.products || []);
    } catch (err) {
      console.error('Error al cargar productos:', err);
      alert('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (product) => {
    // Cargar detalles completos del producto con variantes
    try {
      const response = await productService.getProductByIdAdmin(product.id);
      setEditingProduct(response.product);
      setShowModal(true);
    } catch (err) {
      console.error('Error al cargar producto:', err);
      alert('Error al cargar los detalles del producto');
    }
  };

  const handleSave = async (productData, productId) => {
    try {
      if (productId) {
        // Editar producto existente
        await productService.updateProduct(productId, productData);
        alert('Producto actualizado exitosamente');
      } else {
        // Crear nuevo producto
        await productService.createProduct(productData);
        alert('Producto creado exitosamente');
      }
      loadProducts();
    } catch (err) {
      console.error('Error al guardar producto:', err);
      alert(err.error || 'Error al guardar el producto');
      throw err;
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    
    try {
      await productService.deleteProduct(productId);
      alert('Producto eliminado exitosamente');
      loadProducts();
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      alert('Error al eliminar producto');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="text-center">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1
              style={{
                fontFamily: 'nantes, georgia, serif',
                fontStyle: 'normal',
                fontWeight: 400,
                color: 'rgb(51, 51, 51)',
                fontSize: '30px',
                lineHeight: '38px'
              }}
            >
              Gestión de Productos
            </h1>
            <p
              className="mt-1"
              style={{
                fontFamily: 'graphik, helvetica, sans-serif',
                fontStyle: 'normal',
                fontWeight: 200,
                color: 'rgb(102, 102, 102)',
                fontSize: '14px',
                lineHeight: '20px'
              }}
            >
              {products.length} productos en total
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              style={{
                fontFamily: 'graphik, helvetica, sans-serif',
                fontWeight: 400,
                fontSize: '14px'
              }}
            >
              ← Volver al Dashboard
            </button>
            
            <button
              onClick={() => {
                setEditingProduct(null);
                setShowModal(true);
              }}
              className="px-4 py-2 rounded-lg transition-all"
              style={{
                fontFamily: 'graphik, helvetica, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                backgroundColor: '#000000',
                color: '#FFFFFF'
              }}
            >
              + Agregar Producto
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="p-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variantes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-10 h-10 rounded object-cover mr-3"
                        />
                      )}
                      <span>{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.category || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(product.reference_price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.variants_count || 0} variantes
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de edición */}
      <ProductEditModal
        product={editingProduct}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingProduct(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
};

export default AdminProducts;
