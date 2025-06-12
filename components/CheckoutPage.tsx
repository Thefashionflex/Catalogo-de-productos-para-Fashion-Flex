import React, { useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate, Link } from 'react-router-dom';

const ACCENT_COLOR = 'var(--accent-color-primary)';

const CheckoutPage: React.FC = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (cartItems.length === 0) {
      // Si el carrito está vacío, redirigir al catálogo
      navigate('/');
    }
  }, [cartItems, navigate]);

  const handleConfirmOrder = () => {
    // Aquí, en una aplicación real, se procesaría el pago.
    // Para esta simulación, limpiamos el carrito y navegamos a la página de confirmación.
    clearCart();
    navigate('/order-confirmation');
  };

  if (cartItems.length === 0) {
    // Aunque useEffect redirige, esto previene renderizado momentáneo de la página vacía.
    return null;
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-[var(--light-bg)] via-[var(--light-bg-alt)] to-[var(--light-bg)] font-['Montserrat'] text-[var(--text-dark-primary)] selection:bg-[${ACCENT_COLOR}] selection:text-white`}>
      <div className="grainy-overlay"></div>
      
      <header className={`bg-transparent py-12 md:py-16 border-b-2 border-[${ACCENT_COLOR}]/40 relative`}>
        <div className="absolute inset-0 bg-[var(--light-bg-alt)]/30 backdrop-blur-sm"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h1
            className={`text-5xl md:text-7xl font-['Anton'] uppercase tracking-[0.1em] md:tracking-[0.15em]
                       text-[${ACCENT_COLOR}] select-none`}
          >
            FINALIZAR COMPRA
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-10 md:py-16">
        <div className="max-w-3xl mx-auto bg-[var(--light-bg-alt)]/80 backdrop-blur-md p-6 sm:p-8 rounded-xl shadow-2xl border border-[${ACCENT_COLOR}]/30">
          <h2 className={`text-2xl md:text-3xl font-medium text-[${ACCENT_COLOR}] mb-6 pb-3 border-b border-[${ACCENT_COLOR}]/20 tracking-wide uppercase`}>
            Resumen del Pedido
          </h2>
          
          {cartItems.map(item => (
            <div key={item.cartItemId} className="flex justify-between items-center py-3 border-b border-gray-200/70 last:border-b-0">
              <div className="flex items-center">
                <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md mr-4 border border-gray-200"/>
                <div>
                  <h3 className="text-sm sm:text-base font-medium text-[var(--text-dark-primary)] uppercase">{item.name.toUpperCase()}</h3>
                  <p className="text-xs text-gray-500 uppercase">
                    {item.selectedSize && `Talla: ${item.selectedSize}`}
                    {item.selectedSize && item.selectedVolume && ' / '}
                    {item.selectedVolume && `Vol: ${item.selectedVolume}ML`}
                  </p>
                  <p className="text-xs text-gray-600 uppercase">Cantidad: {item.quantity}</p>
                </div>
              </div>
              <div className="text-right">
                 <p className="text-sm sm:text-base font-semibold text-[var(--accent-color-primary)]">{item.selectedPrice}</p>
                 <p className="text-xs text-gray-500 uppercase">Subtotal: ${ (parseFloat(item.selectedPrice.replace('$', '').replace(',', '')) * item.quantity).toFixed(2) }</p>
              </div>
            </div>
          ))}

          <div className={`mt-8 pt-4 border-t-2 border-[${ACCENT_COLOR}]/30`}>
            <div className="flex justify-between items-center text-lg md:text-xl font-bold mb-6">
              <span className="text-[var(--text-dark-primary)] uppercase">Total del Pedido:</span>
              <span className={`text-[${ACCENT_COLOR}]`}>{getCartTotal()}</span>
            </div>

            {/* Placeholder para formularios de envío y pago */}
            <div className="my-6 p-4 bg-[var(--light-bg)]/50 border border-dashed border-gray-300 rounded-md">
              <h3 className="text-md font-semibold text-[var(--text-dark-secondary)] mb-2 uppercase">Información de Envío y Pago</h3>
              <p className="text-sm text-gray-500">
                En una aplicación completa, aquí irían los formularios para ingresar la dirección de envío y los detalles de pago.
              </p>
            </div>

            <button
              onClick={handleConfirmOrder}
              className={`w-full bg-[${ACCENT_COLOR}] hover:bg-opacity-90 text-white font-bold py-3.5 px-4 rounded-md
                         transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] tracking-wider text-base uppercase
                         focus:outline-none focus:ring-2 focus:ring-[${ACCENT_COLOR}]/70 focus:ring-offset-2 focus:ring-offset-[var(--light-bg-alt)]`}
            >
              Confirmar Pedido y Pagar (Simulado)
            </button>
            <Link 
                to="/" 
                className={`block w-full text-center mt-4 bg-transparent hover:bg-gray-200/70 text-[var(--text-dark-secondary)]
                            border border-gray-300/90 font-medium py-3 px-4 rounded-md
                            transition-colors duration-300 text-sm tracking-wider uppercase`}
            >
                Seguir Comprando
            </Link>
          </div>
        </div>
      </main>
      
      <footer className={`bg-[var(--light-bg-alt)]/70 border-t border-[${ACCENT_COLOR}]/30 text-[var(--text-dark-secondary)] py-8 text-center mt-12`}>
        <div className="container mx-auto px-6">
          <p className="tracking-wider text-sm uppercase">&copy; {new Date().getFullYear()} SPORT FLEX. PROCESO DE COMPRA SEGURO.</p>
        </div>
      </footer>
    </div>
  );
};

export default CheckoutPage;
