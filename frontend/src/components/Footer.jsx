import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-brand-blue text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <img 
              src="https://summa.es/blog/wp-content/uploads/2019/04/LOGO-PRIVALIA-POS-RGB-01-scaled.jpg" 
              alt="Corporación Argom" 
              className="h-12 mb-4 brightness-0 invert"
            />
            <p className="text-neutral-lighter text-sm">
              Soluciones integrales para su empresa desde 2010.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <a href="#inicio" className="text-neutral-lighter hover:text-white transition-colors text-sm">
                  Inicio
                </a>
              </li>
              <li>
                <a href="#productos" className="text-neutral-lighter hover:text-white transition-colors text-sm">
                  Productos
                </a>
              </li>
              <li>
                <a href="#nosotros" className="text-neutral-lighter hover:text-white transition-colors text-sm">
                  Nosotros
                </a>
              </li>
              <li>
                <a href="#contacto" className="text-neutral-lighter hover:text-white transition-colors text-sm">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contacto</h3>
            <ul className="space-y-2 text-sm text-neutral-lighter">
              <li>San José, Costa Rica</li>
              <li>Tel: +506 2222-3333</li>
              <li>Email: info@corporacionargom.com</li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="font-bold text-lg mb-4">Horario</h3>
            <ul className="space-y-2 text-sm text-neutral-lighter">
              <li>Lunes - Viernes</li>
              <li>8:00 AM - 5:00 PM</li>
              <li className="pt-2">Sábados</li>
              <li>8:00 AM - 12:00 PM</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white border-opacity-20 mt-8 pt-8 text-center text-sm text-neutral-lighter">
          <p>&copy; 2024 Corporación Argom. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
