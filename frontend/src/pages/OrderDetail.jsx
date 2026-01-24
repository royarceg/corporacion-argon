import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import orderService from '../services/orderService';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrderDetail = async () => {
      try {
        const response = await orderService.getOrderById(id);
        setOrder(response.order);
      } catch (err) {
        setError(err.error || 'Error al cargar detalle de orden');
      } finally {
        setLoading(false);
      }
    };
    
    loadOrderDetail();
  }, [id]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmada' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelada' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-sm font-medium`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8" style={{ maxWidth: '1420px' }}>
          <div className="text-center">Cargando detalle...</div>
        </div>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8" style={{ maxWidth: '1420px' }}>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error || 'Orden no encontrada'}
          </div>
          <button
            onClick={() => navigate('/ordenes')}
            className="bg-secondary text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Volver a Órdenes
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8" style={{ maxWidth: '1420px' }}>
        <div className="mb-6">
          <button
            onClick={() => navigate('/ordenes')}
            className="text-secondary hover:text-blue-700 flex items-center gap-2"
          >
            ← Volver a Órdenes
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">
                Orden #{order.order_number}
              </h1>
              <p className="text-gray-600">PO Cliente: {order.customer_po}</p>
            </div>
            <div>
              {getStatusBadge(order.status)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Información de la Orden</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-600">Fecha de Orden:</span> {new Date(order.created_at).toLocaleDateString('es-CR')}</p>
                <p><span className="text-gray-600">Ordenado por:</span> {order.created_by}</p>
                {order.wanted_date && (
                  <p><span className="text-gray-600">Fecha Deseada:</span> {new Date(order.wanted_date).toLocaleDateString('es-CR')}</p>
                )}
                {order.confirmed_at && (
                  <p><span className="text-gray-600">Fecha de Confirmación:</span> {new Date(order.confirmed_at).toLocaleDateString('es-CR')}</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Información del Cliente</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-600">Empresa:</span> {order.company_name}</p>
                {order.phone && <p><span className="text-gray-600">Teléfono:</span> {order.phone}</p>}
                {order.address && <p><span className="text-gray-600">Dirección:</span> {order.address}</p>}
              </div>
            </div>
          </div>

          <h3 className="font-semibold text-gray-700 mb-4">Productos</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cant. Solicitada</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Inicial</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Inicial</th>
                  {order.status === 'confirmed' && (
                    <>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cant. Confirmada</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Confirmado</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Confirmado</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items && order.items.map(item => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-sm">{item.sku}</td>
                    <td className="px-4 py-3 text-sm">{item.product_name}</td>
                    <td className="px-4 py-3 text-sm">{item.quantity_requested}</td>
                    <td className="px-4 py-3 text-sm">${parseFloat(item.unit_price_initial).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">${parseFloat(item.line_total_initial).toFixed(2)}</td>
                    {order.status === 'confirmed' && (
                      <>
                        <td className="px-4 py-3 text-sm font-medium">{item.quantity_confirmed || item.quantity_requested}</td>
                        <td className="px-4 py-3 text-sm font-medium">
                          ${parseFloat(item.unit_price_confirmed || item.unit_price_initial).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          ${parseFloat(item.line_total_confirmed || item.line_total_initial).toFixed(2)}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal Inicial:</span>
                <span className="font-medium">${parseFloat(order.subtotal_initial).toFixed(2)}</span>
              </div>
              {order.status === 'confirmed' && order.subtotal_confirmed && (
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total Confirmado:</span>
                  <span className="text-success">${parseFloat(order.subtotal_confirmed).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetail;
