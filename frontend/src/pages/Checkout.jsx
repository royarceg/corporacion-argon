import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import orderService from '../services/orderService';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const cart = location.state?.cart || [];

  const [customerPo, setCustomerPo] = useState('');
  const [wantedDate, setWantedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (cart.length === 0) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8" style={{ maxWidth: '1420px' }}>
          <div className="text-center">
            <p className="text-gray-500 mb-4">El carrito está vacío</p>
            <button
              onClick={() => navigate('/productos')}
              className="bg-secondary text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Ir a Productos
            </button>
          </div>
        </div>
      </>
    );
  }

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const orderData = {
        customer_po: customerPo,
        wanted_date: wantedDate || null,
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        }))
      };

      const response = await orderService.createOrder(orderData);

      if (response.success) {
        alert('Orden creada exitosamente. Recibirá un correo de confirmación.');
        navigate('/ordenes');
      }
    } catch (err) {
      setError(err.error || 'Error al crear la orden');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8" style={{ maxWidth: '1420px' }}>
        <h1 className="text-3xl font-bold text-primary mb-8">Finalizar Orden</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Información de la Orden</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PO del Cliente <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerPo}
                    onChange={(e) => setCustomerPo(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                    placeholder="Ej: 02OCT2023"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Deseada de Entrega
                  </label>
                  <input
                    type="date"
                    value={wantedDate}
                    onChange={(e) => setWantedDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-success text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Procesando...' : 'Confirmar Orden'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-primary mb-4">Resumen</h2>

              <div className="space-y-3 mb-6">
                {cart.map(item => (
                  <div key={item.product_id} className="flex justify-between text-sm">
                    <div>
                      <div className="font-medium">{item.product_name}</div>
                      <div className="text-gray-500">
                        {item.quantity} × ${item.unit_price.toFixed(2)}
                      </div>
                    </div>
                    <div className="font-medium">
                      ${(item.quantity * item.unit_price).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold mb-4">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>

                <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded">
                  <p className="font-medium mb-1">Nota Importante:</p>
                  <p>Los precios mostrados son de referencia. El precio final será confirmado por el administrador.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
