import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminClientProducts = () => {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientProducts, setClientProducts] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadClients();
    loadProducts();
  }, []);

  const loadClients = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/clients', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setClients(data.clients || []);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/products/admin/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error('Error al cargar productos:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadClientProducts = async (clientId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/clients/${clientId}/products`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setClientProducts(new Set(data.product_ids || []));
    } catch (err) {
      console.error('Error al cargar productos del cliente:', err);
    }
  };

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    loadClientProducts(client.id);
  };

  const handleToggleProduct = async (productId) => {
    const newSet = new Set(clientProducts);
    
    try {
      if (newSet.has(productId)) {
        // Desasignar producto
        await fetch(`http://localhost:5001/api/clients/${selectedClient.id}/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        newSet.delete(productId);
      } else {
        // Asignar producto
        await fetch(`http://localhost:5001/api/clients/${selectedClient.id}/products/${productId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        newSet.add(productId);
      }
      
      setClientProducts(newSet);
    } catch (err) {
      console.error('Error al asignar/desasignar producto:', err);
      alert('Error al actualizar la asignación');
    }
  };

  const handleAssignAll = async () => {
    if (!selectedClient) return;
    
    try {
      const response = await fetch(`http://localhost:5001/api/clients/${selectedClient.id}/products/assign-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      const allProductIds = new Set(products.map(p => p.id));
      setClientProducts(allProductIds);
      
      alert('Todos los productos asignados exitosamente');
    } catch (err) {
      console.error('Error al asignar todos:', err);
      alert('Error al asignar todos los productos');
    }
  };

  const handleRemoveAll = async () => {
    if (!selectedClient) return;
    if (!window.confirm('¿Estás seguro de desasignar todos los productos?')) return;
    
    try {
      await fetch(`http://localhost:5001/api/clients/${selectedClient.id}/products/unassign-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setClientProducts(new Set());
      alert('Todos los productos desasignados exitosamente');
    } catch (err) {
      console.error('Error al desasignar todos:', err);
      alert('Error al desasignar todos los productos');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="text-center">Cargando...</div>
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
              Asignación de Productos a Clientes
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
              Gestiona qué productos puede ver cada cliente
            </p>
          </div>
          
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
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Lista de clientes - Izquierda */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h3
                  style={{
                    fontFamily: 'graphik, helvetica, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    color: 'rgb(51, 51, 51)'
                  }}
                >
                  Clientes ({clients.length})
                </h3>
              </div>
              <div className="divide-y">
                {clients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => handleClientSelect(client)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-all ${
                      selectedClient?.id === client.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <p
                      style={{
                        fontFamily: 'graphik, helvetica, sans-serif',
                        fontWeight: selectedClient?.id === client.id ? 500 : 400,
                        fontSize: '14px',
                        color: 'rgb(51, 51, 51)'
                      }}
                    >
                      {client.company_name}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lista de productos - Derecha */}
          <div className="col-span-9">
            {!selectedClient ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p
                  style={{
                    fontFamily: 'graphik, helvetica, sans-serif',
                    fontWeight: 400,
                    fontSize: '16px',
                    color: 'rgb(102, 102, 102)'
                  }}
                >
                  Selecciona un cliente para ver sus productos asignados
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm">
                {/* Header con acciones */}
                <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
                  <div>
                    <h3
                      style={{
                        fontFamily: 'graphik, helvetica, sans-serif',
                        fontWeight: 500,
                        fontSize: '16px',
                        color: 'rgb(51, 51, 51)'
                      }}
                    >
                      {selectedClient.company_name}
                    </h3>
                    <p
                      className="mt-1"
                      style={{
                        fontFamily: 'graphik, helvetica, sans-serif',
                        fontWeight: 200,
                        fontSize: '14px',
                        color: 'rgb(102, 102, 102)'
                      }}
                    >
                      {clientProducts.size} de {products.length} productos asignados
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleAssignAll}
                      className="px-4 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-all"
                      style={{
                        fontFamily: 'graphik, helvetica, sans-serif',
                        fontWeight: 400,
                        fontSize: '14px'
                      }}
                    >
                      Asignar Todos
                    </button>
                    <button
                      onClick={handleRemoveAll}
                      className="px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-all"
                      style={{
                        fontFamily: 'graphik, helvetica, sans-serif',
                        fontWeight: 400,
                        fontSize: '14px'
                      }}
                    >
                      Desasignar Todos
                    </button>
                  </div>
                </div>

                {/* Tabla de productos */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                          <input
                            type="checkbox"
                            checked={clientProducts.size === products.length}
                            onChange={() => {
                              if (clientProducts.size === products.length) {
                                handleRemoveAll();
                              } else {
                                handleAssignAll();
                              }
                            }}
                            className="w-4 h-4 rounded border-gray-300"
                          />
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
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product) => (
                        <tr
                          key={product.id}
                          className={`hover:bg-gray-50 ${
                            clientProducts.has(product.id) ? 'bg-blue-50' : ''
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={clientProducts.has(product.id)}
                              onChange={() => handleToggleProduct(product.id)}
                              className="w-4 h-4 rounded border-gray-300"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {product.sku}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {product.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.category || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              clientProducts.has(product.id)
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {clientProducts.has(product.id) ? 'Asignado' : 'No asignado'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminClientProducts;
