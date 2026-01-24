import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import orderService from '../services/orderService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    confirmed: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await orderService.getAllOrders();
      setOrders(response.orders);
      
      // Calcular estadísticas
      const pending = response.orders.filter(o => o.status === 'pending').length;
      const confirmed = response.orders.filter(o => o.status === 'confirmed').length;
      
      setStats({
        pending,
        confirmed,
        total: response.orders.length
      });
    } catch (err) {
      setError(err.error || 'Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8" style={{ maxWidth: '1420px' }}>
          <div className="text-center">Cargando dashboard...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8" style={{ maxWidth: '1420px' }}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-primary">Dashboard Administrativo</h1>
          
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/admin/usuarios')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              style={{
                fontFamily: 'graphik, helvetica, sans-serif',
                fontWeight: 400,
                fontSize: '14px'
              }}
            >
              Gestionar Usuarios
            </button>
            
            <button
              onClick={() => navigate('/admin/asignacion')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              style={{
                fontFamily: 'graphik, helvetica, sans-serif',
                fontWeight: 400,
                fontSize: '14px'
              }}
            >
              Asignación de Productos
            </button>
            
            <button
              onClick={() => navigate('/admin/productos')}
              className="px-4 py-2 rounded-lg transition-all"
              style={{
                fontFamily: 'graphik, helvetica, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                backgroundColor: '#000000',
                color: '#FFFFFF'
              }}
            >
              Gestionar Productos
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-gray-500 text-sm mb-2">Órdenes Pendientes</div>
            <div className="text-3xl font-bold text-warning">{stats.pending}</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-gray-500 text-sm mb-2">Órdenes Confirmadas</div>
            <div className="text-3xl font-bold text-success">{stats.confirmed}</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-gray-500 text-sm mb-2">Total de Órdenes</div>
            <div className="text-3xl font-bold text-primary">{stats.total}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-primary mb-4">Órdenes Recientes</h2>
          
          {orders.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay órdenes registradas</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orden #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ordenado Por</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.slice(0, 10).map(order => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {order.order_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {order.company_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {order.created_by}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(order.created_at).toLocaleDateString('es-CR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : order.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {order.status === 'pending' ? 'Pendiente' : order.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        ${parseFloat(order.subtotal_confirmed || order.subtotal_initial).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
