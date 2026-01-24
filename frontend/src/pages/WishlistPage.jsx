import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientWelcomeBar from '../components/ClientWelcomeBar';
import ClientNavbar from '../components/ClientNavbar';
import wishlistService from '../services/wishlistService';
import cartService from '../services/cartService';

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadWishlist();
    loadCartCount();
  }, []);

  const loadWishlist = async () => {
    try {
      const response = await wishlistService.getWishlist();
      setWishlistItems(response.wishlist || []);
      setWishlistCount(response.wishlist?.length || 0);
    } catch (err) {
      console.error('Error al cargar wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCartCount = async () => {
    try {
      const response = await cartService.getCartCount();
      setCartCount(response.items_count || 0);
    } catch (err) {
      console.error('Error al cargar carrito:', err);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      loadWishlist();
    } catch (err) {
      console.error('Error al eliminar de wishlist:', err);
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
      <>
        <ClientWelcomeBar />
        <ClientNavbar wishlistCount={wishlistCount} cartCount={cartCount} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Cargando lista de deseos...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <ClientWelcomeBar />
      <ClientNavbar wishlistCount={wishlistCount} cartCount={cartCount} />

      <div className="mx-auto" style={{ maxWidth: '1420px', paddingLeft: '25px', paddingRight: '25px', paddingTop: '40px', paddingBottom: '40px' }}>
        {/* Título */}
        <div className="mb-8">
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
            Lista de Deseos
          </h1>
          <p
            className="mt-2"
            style={{
              fontFamily: 'graphik, helvetica, sans-serif',
              fontStyle: 'normal',
              fontWeight: 200,
              color: 'rgb(102, 102, 102)',
              fontSize: '14px',
              lineHeight: '20px'
            }}
          >
            {wishlistItems.length} {wishlistItems.length === 1 ? 'producto' : 'productos'}
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="w-24 h-24 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <p
              className="mb-4"
              style={{
                fontFamily: 'graphik, helvetica, sans-serif',
                fontStyle: 'normal',
                fontWeight: 400,
                color: 'rgb(51, 51, 51)',
                fontSize: '18px',
                lineHeight: '26px'
              }}
            >
              Tu lista de deseos está vacía
            </p>
            <button
              onClick={() => navigate('/productos')}
              className="px-6 py-3 rounded-lg transition-all"
              style={{
                fontFamily: 'graphik, helvetica, sans-serif',
                fontStyle: 'normal',
                fontWeight: 500,
                color: 'rgb(255, 255, 255)',
                fontSize: '14px',
                lineHeight: '20px',
                backgroundColor: '#000000'
              }}
            >
              Explorar productos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.wishlist_id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Imagen */}
                <div className="relative" style={{ height: '200px' }}>
                  <img
                    src={item.image_url || '/assets/images/Nuevo1.png'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Botón eliminar */}
                  <button
                    onClick={() => handleRemoveFromWishlist(item.product_id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-all"
                  >
                    <svg
                      className="w-5 h-5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                      />
                    </svg>
                  </button>
                </div>

                {/* Información */}
                <div className="p-4">
                  <h3
                    className="mb-2"
                    style={{
                      fontFamily: 'graphik, helvetica, sans-serif',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      color: 'rgb(51, 51, 51)',
                      fontSize: '16px',
                      lineHeight: '24px'
                    }}
                  >
                    {item.name}
                  </h3>

                  <p
                    className="mb-4"
                    style={{
                      fontFamily: 'graphik, helvetica, sans-serif',
                      fontStyle: 'normal',
                      fontWeight: 500,
                      color: 'rgb(0, 0, 0)',
                      fontSize: '18px',
                      lineHeight: '26px'
                    }}
                  >
                    {formatPrice(item.price)}
                  </p>

                  <button
                    onClick={() => navigate(`/productos`)}
                    className="w-full py-2 rounded-lg border border-black hover:bg-black hover:text-white transition-all"
                    style={{
                      fontFamily: 'graphik, helvetica, sans-serif',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      fontSize: '14px',
                      lineHeight: '20px'
                    }}
                  >
                    Ver producto
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default WishlistPage;
