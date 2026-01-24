import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import PublicProductCard from '../components/PublicProductCard';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const categories = [
  'Uniformes',
  'Camisas',
  'Pantalones',
  'Chalecos',
  'Accesorios',
  'Materia Prima',
  'Drones'
];

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Uniformes');
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Bloquear HomePage para usuarios logueados - redirigir a productos
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/productos', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const categoryProducts = {
    'Uniformes': [
      { id: 1, name: 'Ballistic Helmet', image: '/assets/images/Nuevo1.png' },
      { id: 2, name: 'SecPro Spartan', image: '/assets/images/Nuevo2.png' },
      { id: 3, name: 'Knuckle Gloves', image: '/assets/images/Nuevo3.png' },
      { id: 4, name: 'Tactical Pants', image: '/assets/images/Nuevo4.png' }
    ],
    'Camisas': [
      { id: 5, name: 'Taser PULSE 2', image: '/assets/images/Nuevo5.png' },
      { id: 6, name: 'Gas Mask', image: '/assets/images/Nuevo6.png' },
      { id: 7, name: 'Ballistic Helmet', image: '/assets/images/Nuevo1.png' },
      { id: 8, name: 'SecPro Spartan', image: '/assets/images/Nuevo2.png' }
    ],
    'Pantalones': [
      { id: 9, name: 'Tactical Pants', image: '/assets/images/Nuevo4.png' },
      { id: 10, name: 'Knuckle Gloves', image: '/assets/images/Nuevo3.png' },
      { id: 11, name: 'Gas Mask', image: '/assets/images/Nuevo6.png' },
      { id: 12, name: 'Taser PULSE 2', image: '/assets/images/Nuevo5.png' }
    ],
    'Chalecos': [
      { id: 13, name: 'SecPro Spartan', image: '/assets/images/Nuevo2.png' },
      { id: 14, name: 'Ballistic Helmet', image: '/assets/images/Nuevo1.png' },
      { id: 15, name: 'Tactical Pants', image: '/assets/images/Nuevo4.png' },
      { id: 16, name: 'Knuckle Gloves', image: '/assets/images/Nuevo3.png' }
    ],
    'Accesorios': [
      { id: 17, name: 'Ballistic Helmet', image: '/assets/images/Nuevo1.png' },
      { id: 18, name: 'Knuckle Gloves', image: '/assets/images/Nuevo3.png' },
      { id: 19, name: 'Gas Mask', image: '/assets/images/Nuevo6.png' },
      { id: 20, name: 'Taser PULSE 2', image: '/assets/images/Nuevo5.png' }
    ],
    'Materia Prima': [
      { id: 21, name: 'SecPro Spartan', image: '/assets/images/Nuevo2.png' },
      { id: 22, name: 'Tactical Pants', image: '/assets/images/Nuevo4.png' },
      { id: 23, name: 'Ballistic Helmet', image: '/assets/images/Nuevo1.png' },
      { id: 24, name: 'Gas Mask', image: '/assets/images/Nuevo6.png' }
    ],
    'Drones': [
      { id: 25, name: 'Taser PULSE 2', image: '/assets/images/Nuevo5.png' },
      { id: 26, name: 'Knuckle Gloves', image: '/assets/images/Nuevo3.png' },
      { id: 27, name: 'SecPro Spartan', image: '/assets/images/Nuevo2.png' },
      { id: 28, name: 'Gas Mask', image: '/assets/images/Nuevo6.png' }
    ]
  };

  // Auto-rotate categories
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);

      setTimeout(() => {
        setSelectedCategory(prevCategory => {
          const currentIndex = categories.indexOf(prevCategory);
          const nextIndex = (currentIndex + 1) % categories.length;
          return categories[nextIndex];
        });
        setIsTransitioning(false);
      }, 500);
    }, 5000); // Cambia cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  const handleCategoryClick = (category) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedCategory(category);
      setIsTransitioning(false);
    }, 500);
  };

  useEffect(() => {
    const sampleProducts = [
      {
        id: 7,
        sku: 'TAC001',
        name: 'Ballistic Helmet',
        description: 'Casco balístico de alta protección para operaciones tácticas',
        size: 'Única',
        color: 'Negro Táctico',
        image_url: '/assets/images/Nuevo1.png'
      },
      {
        id: 8,
        sku: 'TAC002',
        name: 'SecPro Spartan',
        description: 'Equipo de seguridad profesional de última generación',
        size: 'L',
        color: 'Negro',
        image_url: '/assets/images/Nuevo2.png'
      },
      {
        id: 9,
        sku: 'TAC003',
        name: 'Knuckle Gloves',
        description: 'Guantes tácticos reforzados con protección en nudillos',
        size: 'M',
        color: 'Negro',
        image_url: '/assets/images/Nuevo3.png'
      },
      {
        id: 10,
        sku: 'TAC004',
        name: 'Tactical Pants',
        description: 'Pantalones tácticos con múltiples bolsillos y refuerzos',
        size: 'L',
        color: 'Negro Táctico',
        image_url: '/assets/images/Nuevo4.png'
      },
      {
        id: 11,
        sku: 'TAC005',
        name: 'Taser PULSE 2',
        description: 'Dispositivo de defensa no letal de última tecnología',
        size: 'Única',
        color: 'Negro',
        image_url: '/assets/images/Nuevo5.png'
      },
      {
        id: 12,
        sku: 'TAC006',
        name: 'Gas Mask',
        description: 'Máscara de gas profesional con filtros certificados',
        size: 'Única',
        color: 'Negro',
        image_url: '/assets/images/Nuevo6.png'
      }
    ];
    setProducts(sampleProducts);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Top Banner - Color #FBF8F6 - MÁS ANGOSTO */}
      <div className="py-2 px-6 border-b border-gray-200" style={{ backgroundColor: '#FBF8F6' }}>
        <div className="flex justify-center items-center">
          <p className="text-center text-sm" style={{ color: '#000000' }}>
            Compra online productos al por mayor de más de 100&nbsp;000&nbsp;marcas.{' '}
            <Link
              to="/login"
              className="underline hover:text-brand-green transition-colors"
              style={{ color: '#000000', textDecorationColor: '#757575', fontWeight: 'normal' }}
            >
              Registrarme
            </Link>
          </p>
        </div>
      </div>

      <PublicNavbar />

      {/* Hero Section con Video de Fondo */}
      <section id="inicio" className="relative w-full" style={{ height: '600px', zIndex: 1 }}>
        {/* Video de fondo */}
        <video
          className="absolute top-0 left-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/assets/videos/Video Fabrica China 02.mp4" type="video/mp4" />
        </video>

        {/* Overlay oscuro para mejorar legibilidad */}
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-40"></div>

        {/* Contenido encima del video - ALINEADO A LA IZQUIERDA */}
        <div className="relative flex flex-col justify-center h-full container mx-auto" style={{ maxWidth: '1420px', paddingLeft: '25px', paddingRight: '25px' }}>
          <h1
            className="mb-6 text-left"
            style={{
              fontFamily: 'nantes, georgia, serif',
              fontStyle: 'normal',
              fontWeight: 400,
              color: 'rgb(255, 255, 255)',
              fontSize: '52px',
              lineHeight: '64px'
            }}
          >
            Juntos crecemos nuestros negocios
          </h1>
          <h3
            className="mb-8 text-left"
            style={{
              fontFamily: 'graphik, helvetica, sans-serif',
              fontStyle: 'normal',
              fontWeight: 400,
              color: 'rgb(255, 255, 255)',
              fontSize: '22px',
              lineHeight: '32px'
            }}
          >
            Regístrate para acceder a precios mayoristas en más de 200 productos
          </h3>
          <div className="text-left">
            <Link
              to="/login"
              className="inline-block px-8 py-4 rounded transition-all"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#000000',
                border: '2px solid #000000',
                fontFamily: 'graphik, helvetica, sans-serif',
                fontStyle: 'normal',
                fontWeight: 200,
                fontSize: '14px',
                lineHeight: '20px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#000000';
                e.target.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#FFFFFF';
                e.target.style.color = '#000000';
              }}
            >
              Registrarse para comprar
            </Link>
          </div>
        </div>
      </section>

      {/* Productos Destacados Section - ALINEADO A LA IZQUIERDA - ALTURA 486px */}
      <section className="py-16" style={{ backgroundColor: '#FBF8F6', height: '486px' }}>
        <div className="container mx-auto" style={{ maxWidth: '1420px', paddingLeft: '25px', paddingRight: '25px' }}>
          {/* Título */}
          <h2
            className="mb-8 text-left"
            style={{
              fontFamily: 'nantes, georgia, serif',
              fontStyle: 'normal',
              fontWeight: 400,
              color: 'rgb(51, 51, 51)',
              fontSize: '30px',
              lineHeight: '38px'
            }}
          >
            Productos destacados
          </h2>

          {/* Categorías */}
          <div className="flex justify-start gap-3 mb-12 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className="px-6 py-2 rounded-full transition-all"
                style={{
                  fontFamily: 'graphik, helvetica, sans-serif',
                  fontStyle: 'normal',
                  fontWeight: 200,
                  color: 'rgb(51, 51, 51)',
                  fontSize: '14px',
                  lineHeight: '20px',
                  border: selectedCategory === category ? '1px solid #000000' : '1px solid #D1D5DB',
                  backgroundColor: '#FFFFFF'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== category) {
                    e.target.style.borderColor = '#000000';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== category) {
                    e.target.style.borderColor = '#D1D5DB';
                  }
                }}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Grid de Productos - responsivo, máx 1344px */}
          <div
            className="products-transition mx-auto"
            style={{
              maxWidth: '1344px',
              height: '274px',
              opacity: isTransitioning ? 0 : 1,
              transform: isTransitioning ? 'translateY(20px)' : 'translateY(0)'
            }}
          >
            <div className="flex gap-6">
              {categoryProducts[selectedCategory].map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 cursor-pointer"
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{
                      width: '217.33px',
                      height: '217.33px',
                      objectFit: 'cover'
                    }}
                  />
                  <h3
                    className="product-name-underline"
                    style={{
                      fontFamily: 'graphik, helvetica, sans-serif',
                      fontStyle: 'normal',
                      fontWeight: 500,
                      color: 'rgb(51, 51, 51)',
                      fontSize: '14px',
                      lineHeight: '20px',
                      marginTop: '8px',
                      position: 'relative',
                      display: 'inline-block'
                    }}
                    data-hovered={hoveredProduct === product.id}
                  >
                    {product.name}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Corporación Argon Section - 900px */}
      <section style={{ backgroundColor: '#41252A', height: '900px' }}>
        <div className="container mx-auto pt-8" style={{ maxWidth: '1420px', paddingLeft: '25px', paddingRight: '25px' }}>
          {/* Textos - 128px */}
          <div className="flex justify-between items-start" style={{ height: '128px', marginBottom: '20px' }}>
            {/* Textos izquierda */}
            <div>
              <h2
                style={{
                  fontFamily: 'nantes, georgia, serif',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  color: 'rgb(241, 242, 159)',
                  fontSize: '38px',
                  lineHeight: '50px'
                }}
              >
                Corporación Argon.
              </h2>
              <h3
                style={{
                  fontFamily: 'graphik, helvetica, sans-serif',
                  fontStyle: 'normal',
                  fontWeight: 100,
                  color: 'rgb(255, 255, 255)',
                  fontSize: '30px',
                  lineHeight: '38px',
                  whiteSpace: 'nowrap'
                }}
              >
                Importa productos desde China.
              </h3>
            </div>

            {/* Texto derecha - máximo 700px para 2 líneas */}
            <div style={{ maxWidth: '700px', marginLeft: '150px' }}>
              <p
                style={{
                  fontFamily: 'graphik, helvetica, sans-serif',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  color: 'rgb(255, 255, 255)',
                  fontSize: '22px',
                  lineHeight: '32px'
                }}
              >
                Te ayudamos a descubrir nuevos productos y a contactar con marcas que harán evolucionar tu negocio.
              </p>
            </div>
          </div>

          {/* Imagen - ajustada al contenedor */}
          <div className="flex justify-center">
            <img
              src="/assets/images/China Importer.jpg"
              alt="China Importer"
              style={{
                width: '100%',
                maxWidth: '1370px',
                height: '660px',
                objectFit: 'cover'
              }}
            />
          </div>
        </div>
      </section>

      {/* Servicio al Cliente Section - 1440 x 533 */}
      <section style={{ backgroundColor: '#595605', height: '533px' }}>
        <div className="flex items-center justify-between mx-auto" style={{ height: '100%', maxWidth: '1420px', padding: '0 25px' }}>
          {/* Video izquierda */}
          <div style={{ width: '437px', height: '437px' }}>
            <video 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              autoPlay
              muted
              loop
              playsInline
            >
              <source src="/assets/videos/Servicio al cliente 01.mp4" type="video/mp4" />
            </video>
          </div>

          {/* Texto centro */}
          <div style={{ flex: 1, textAlign: 'center', padding: '0 60px' }}>
            <h2
              style={{
                fontFamily: 'nantes, georgia, serif',
                fontStyle: 'normal',
                fontWeight: 400,
                color: 'rgb(255, 255, 255)',
                fontSize: '38px',
                lineHeight: '50px',
                marginBottom: '20px'
              }}
            >
              Tenemos al mejor servicio al cliente
            </h2>
            <p
              style={{
                fontFamily: 'graphik, helvetica, sans-serif',
                fontStyle: 'normal',
                fontWeight: 400,
                color: 'rgb(255, 255, 255)',
                fontSize: '16px',
                lineHeight: '20px',
                width: '370px',
                height: '60px',
                margin: '0 auto 20px'
              }}
            >
              En Corporación Argon encontrarás todos los<br />
              productos que necesita para su<br />
              negocio
            </p>
            <Link 
              to="/login" 
              className="inline-block px-8 py-3 rounded transition-all"
              style={{ 
                backgroundColor: '#FFFFFF', 
                color: '#000000',
                border: '2px solid #000000',
                fontFamily: 'graphik, helvetica, sans-serif',
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '20px',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#000000';
                e.target.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#FFFFFF';
                e.target.style.color = '#000000';
              }}
            >
              Registrarse para comprar
            </Link>
          </div>

          {/* Video derecha */}
          <div style={{ width: '437px', height: '437px' }}>
            <video 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              autoPlay
              muted
              loop
              playsInline
            >
              <source src="/assets/videos/Servicio al cliente 02.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      {/* Explora Productos Nuevos Section */}
      <section className="py-20" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="container mx-auto" style={{ maxWidth: '1420px', paddingLeft: '25px', paddingRight: '25px' }}>
          <h2
            className="mb-12 text-left"
            style={{
              fontFamily: 'nantes, georgia, serif',
              fontStyle: 'normal',
              fontWeight: 400,
              color: 'rgb(51, 51, 51)',
              fontSize: '30px',
              lineHeight: '38px'
            }}
          >
            Explora Productos Nuevos
          </h2>
          {/* Grid de 3 columnas con imágenes 500x398 - CON CARRUSEL */}
          <div className="relative">
            {/* Flecha Izquierda - Siempre visible */}
            <button
              onClick={() => setCurrentSlide(currentSlide > 0 ? currentSlide - 1 : 0)}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 transition-all hover:opacity-100"
              style={{
                opacity: currentSlide > 0 ? 0.4 : 0.2,
                left: '10px',
                cursor: currentSlide > 0 ? 'pointer' : 'not-allowed'
              }}
              disabled={currentSlide === 0}
            >
              <svg className="w-8 h-8" fill="none" stroke="#000000" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Contenedor de productos con overflow - ancho para exactamente 3 productos */}
            <div className="overflow-hidden" style={{ marginLeft: '70px', marginRight: '70px' }}>
              <div 
                className="flex gap-12 transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentSlide * (400 + 48)}px)`,
                  width: '1296px'
                }}
              >
                {/* Slide 1 - Producto 1 */}
                <div className="flex-shrink-0 relative overflow-hidden group">
                  <img
                    src="/assets/images/Nuevo1.png"
                    alt="Ballistic Helmet"
                    className="transition-transform duration-500 ease-in-out group-hover:scale-110"
                    style={{
                      width: '400px',
                      height: '318px',
                      objectFit: 'cover'
                    }}
                  />
                  <div className="absolute bottom-6 left-6">
                    <h3
                      style={{
                        fontFamily: 'nantes, georgia, serif',
                        fontStyle: 'normal',
                        fontWeight: 400,
                        color: 'rgb(255, 255, 255)',
                        fontSize: '22px',
                        lineHeight: '32px'
                      }}
                    >
                      Ballistic Helmet
                    </h3>
                  </div>
                </div>

                {/* Slide 1 - Producto 2 */}
                <div className="flex-shrink-0 relative overflow-hidden group">
                  <img
                    src="/assets/images/Nuevo2.png"
                    alt="SecPro Spartan"
                    className="transition-transform duration-500 ease-in-out group-hover:scale-110"
                    style={{
                      width: '400px',
                      height: '318px',
                      objectFit: 'cover'
                    }}
                  />
                  <div className="absolute bottom-6 left-6">
                    <h3
                      style={{
                        fontFamily: 'nantes, georgia, serif',
                        fontStyle: 'normal',
                        fontWeight: 400,
                        color: 'rgb(255, 255, 255)',
                        fontSize: '22px',
                        lineHeight: '32px'
                      }}
                    >
                      SecPro Spartan
                    </h3>
                  </div>
                </div>

                {/* Slide 1 - Producto 3 */}
                <div className="flex-shrink-0 relative overflow-hidden group">
                  <img
                    src="/assets/images/Nuevo3.png"
                    alt="Knuckle Gloves"
                    className="transition-transform duration-500 ease-in-out group-hover:scale-110"
                    style={{
                      width: '400px',
                      height: '318px',
                      objectFit: 'cover'
                    }}
                  />
                  <div className="absolute bottom-6 left-6">
                    <h3
                      style={{
                        fontFamily: 'nantes, georgia, serif',
                        fontStyle: 'normal',
                        fontWeight: 400,
                        color: 'rgb(255, 255, 255)',
                        fontSize: '22px',
                        lineHeight: '32px'
                      }}
                    >
                      Knuckle Gloves
                    </h3>
                  </div>
                </div>

                {/* Slide 2 - Producto 4 */}
                <div className="flex-shrink-0 relative overflow-hidden group">
                  <img
                    src="/assets/images/Nuevo4.png"
                    alt="Tactical Pants"
                    className="transition-transform duration-500 ease-in-out group-hover:scale-110"
                    style={{
                      width: '400px',
                      height: '318px',
                      objectFit: 'cover'
                    }}
                  />
                  <div className="absolute bottom-6 left-6">
                    <h3
                      style={{
                        fontFamily: 'nantes, georgia, serif',
                        fontStyle: 'normal',
                        fontWeight: 400,
                        color: 'rgb(255, 255, 255)',
                        fontSize: '22px',
                        lineHeight: '32px'
                      }}
                    >
                      Tactical Pants
                    </h3>
                  </div>
                </div>

                {/* Slide 2 - Producto 5 */}
                <div className="flex-shrink-0 relative overflow-hidden group">
                  <img
                    src="/assets/images/Nuevo5.png"
                    alt="Taser PULSE 2"
                    className="transition-transform duration-500 ease-in-out group-hover:scale-110"
                    style={{
                      width: '400px',
                      height: '318px',
                      objectFit: 'cover'
                    }}
                  />
                  <div className="absolute bottom-6 left-6">
                    <h3
                      style={{
                        fontFamily: 'nantes, georgia, serif',
                        fontStyle: 'normal',
                        fontWeight: 400,
                        color: 'rgb(255, 255, 255)',
                        fontSize: '22px',
                        lineHeight: '32px'
                      }}
                    >
                      Taser PULSE 2
                    </h3>
                  </div>
                </div>

                {/* Slide 2 - Producto 6 */}
                <div className="flex-shrink-0 relative overflow-hidden group">
                  <img
                    src="/assets/images/Nuevo6.png"
                    alt="Gas Mask"
                    className="transition-transform duration-500 ease-in-out group-hover:scale-110"
                    style={{
                      width: '400px',
                      height: '318px',
                      objectFit: 'cover'
                    }}
                  />
                  <div className="absolute bottom-6 left-6">
                    <h3
                      style={{
                        fontFamily: 'nantes, georgia, serif',
                        fontStyle: 'normal',
                        fontWeight: 400,
                        color: 'rgb(255, 255, 255)',
                        fontSize: '22px',
                        lineHeight: '32px'
                      }}
                    >
                      Gas Mask
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Flecha Derecha - Siempre visible */}
            <button
              onClick={() => setCurrentSlide(currentSlide < 3 ? currentSlide + 1 : 3)}
              className="absolute top-1/2 transform -translate-y-1/2 z-10 transition-all hover:opacity-100"
              style={{
                opacity: currentSlide < 3 ? 0.4 : 0.2,
                right: '10px',
                cursor: currentSlide < 3 ? 'pointer' : 'not-allowed'
              }}
              disabled={currentSlide === 3}
            >
              <svg className="w-8 h-8" fill="none" stroke="#000000" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Compra productos de calidad respaldada Section - 760px */}
      <section style={{ backgroundColor: '#f1f29f', height: '760px' }}>
        <div className="container mx-auto py-16" style={{ maxWidth: '1420px', paddingLeft: '25px', paddingRight: '25px' }}>
          {/* Título */}
          <h2
            className="mb-8 text-left"
            style={{
              fontFamily: 'nantes, georgia, serif',
              fontStyle: 'normal',
              fontWeight: 400,
              color: 'rgb(51, 51, 51)',
              fontSize: '30px',
              lineHeight: '38px'
            }}
          >
            Compra productos de calidad respaldada
          </h2>

          {/* Categorías */}
          <div className="flex justify-start gap-3 mb-12 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className="px-6 py-2 rounded-full transition-all"
                style={{
                  fontFamily: 'graphik, helvetica, sans-serif',
                  fontStyle: 'normal',
                  fontWeight: 200,
                  color: 'rgb(51, 51, 51)',
                  fontSize: '14px',
                  lineHeight: '20px',
                  border: selectedCategory === category ? '1px solid #000000' : '1px solid #D1D5DB',
                  backgroundColor: '#FFFFFF'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== category) {
                    e.target.style.borderColor = '#000000';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== category) {
                    e.target.style.borderColor = '#D1D5DB';
                  }
                }}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Grid de 4 videos - 520px de altura */}
          <div className="grid grid-cols-4 gap-6" style={{ height: '520px' }}>
            {/* Video 1 - Chaleco */}
            <div style={{ height: '520px' }}>
              <video
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                autoPlay
                muted
                loop
                playsInline
              >
                <source src="/assets/videos/Chaleco.mp4" type="video/mp4" />
              </video>
            </div>

            {/* Video 2 - Jacket Azul */}
            <div style={{ height: '520px' }}>
              <video
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                autoPlay
                muted
                loop
                playsInline
              >
                <source src="/assets/videos/Jacket azul.mp4" type="video/mp4" />
              </video>
            </div>

            {/* Video 3 - Jacket Negra */}
            <div style={{ height: '520px' }}>
              <video
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                autoPlay
                muted
                loop
                playsInline
              >
                <source src="/assets/videos/Jacket Negra.mp4" type="video/mp4" />
              </video>
            </div>

            {/* Video 4 - Jacket Verde */}
            <div style={{ height: '520px' }}>
              <video
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                autoPlay
                muted
                loop
                playsInline
              >
                <source src="/assets/videos/Jacket Verde.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="productos" className="py-20 bg-neutral-lighter">
        <div className="container mx-auto" style={{ maxWidth: '1420px', paddingLeft: '25px', paddingRight: '25px' }}>
          <div className="text-center mb-16">
            <h2 
              className="mb-4"
              style={{
                fontFamily: 'nantes, georgia, serif',
                fontStyle: 'normal',
                fontWeight: 400,
                color: 'rgb(51, 51, 51)',
                fontSize: '52px',
                lineHeight: '64px'
              }}
            >
              Nuestros Productos
            </h2>
            <p 
              className="max-w-2xl mx-auto"
              style={{
                fontFamily: 'graphik, helvetica, sans-serif',
                fontStyle: 'normal',
                fontWeight: 500,
                color: 'rgb(51, 51, 51)',
                fontSize: '18px',
                lineHeight: '26px'
              }}
            >
              Descubre nuestra amplia gama de productos diseñados para satisfacer las necesidades de tu empresa
            </p>
            <div className="mt-6 inline-block bg-secondary-yellow bg-opacity-10 text-brand-blue px-6 py-3 rounded-lg">
              <p className="text-sm font-medium">
                Los precios están disponibles solo para clientes registrados
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {products.map(product => (
              <PublicProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/login"
              className="inline-block bg-brand-green hover:bg-secondary-green text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Iniciar Sesión para Ver Precios
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-20 bg-neutral-lighter">
        <div className="container mx-auto" style={{ maxWidth: '1420px', paddingLeft: '25px', paddingRight: '25px' }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-brand-blue mb-4">Contáctenos</h2>
              <p className="text-xl text-neutral-gray">
                ¿Listo para empezar? Estamos aquí para ayudarle
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <div className="w-16 h-16 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="font-bold text-brand-blue mb-2">Teléfono</h3>
                <p className="text-neutral-gray">+506 8869 4519</p>
              </div>

              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <div className="w-16 h-16 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-brand-blue mb-2">Email</h3>
                <p className="text-neutral-gray">info@corporacionargom.com</p>
              </div>

              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <div className="w-16 h-16 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-brand-blue mb-2">Ubicación</h3>
                <p className="text-neutral-gray">San José, Costa Rica</p>
              </div>
            </div>

            <div className="bg-brand-blue text-white rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">¿Ya es cliente?</h3>
              <p className="text-neutral-lighter mb-6">
                Acceda a su portal personalizado para realizar pedidos y ver su historial
              </p>
              <Link
                to="/login"
                className="inline-block bg-brand-green hover:bg-secondary-green text-white px-8 py-4 rounded-lg font-semibold transition-colors"
              >
                Iniciar Sesión Ahora
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
