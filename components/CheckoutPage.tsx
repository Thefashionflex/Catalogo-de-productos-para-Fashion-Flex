
import React, { useEffect, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate, Link } from 'react-router-dom';

const ACCENT_COLOR = 'var(--accent-color-primary)';

const CheckoutPage: React.FC = () => {
  const { cartItems, getCartTotal, processOrderAndClearCart } = useCart(); // Updated to use processOrderAndClearCart
  const navigate = useNavigate();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (cartItems.length === 0 && !isProcessingPayment) {
      navigate('/');
    }
  }, [cartItems, navigate, isProcessingPayment]);

  const handleMercadoPagoPayment = async () => {
    setIsProcessingPayment(true);
    console.log("Simulating: User clicks 'Pagar con Mercado Pago'.");
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    console.log("Simulating: Mercado Pago SDK collects payment information and returns a payment token/ID.");
    const mockPaymentToken = `mock_mp_token_${Date.now()}`;
    console.log(`Simulating: Received mock payment token: ${mockPaymentToken}`);
    console.log("Simulating: Sending payment token to backend endpoint...");
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); 
      console.log("Simulating: Backend successfully processed payment with Mercado Pago.");
      
      processOrderAndClearCart(); // Call the updated function
      navigate('/order-confirmation');

    } catch (error) {
      console.error("Simulating: Error during payment processing:", error);
      alert("Hubo un error al procesar tu pago. Por favor, inténtalo de nuevo.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (cartItems.length === 0 && !isProcessingPayment) {
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

            <div className="my-6 p-4 bg-[var(--light-bg)]/50 border border-dashed border-gray-300 rounded-md">
              <h3 className="text-md font-semibold text-[var(--text-dark-secondary)] mb-2 uppercase">Método de Pago</h3>
              <p className="text-sm text-gray-500">
                Serás dirigido a Mercado Pago para completar tu pago de forma segura.
                En una aplicación real, aquí podrías integrar Mercado Pago Checkout Bricks para un formulario de pago incrustado o un botón que redirija a Checkout Pro.
              </p>
              <p className="text-sm text-blue-600 mt-2 font-medium">Nota: Al confirmar, el inventario se descontará localmente (simulación).</p>
            </div>

            <button
              onClick={handleMercadoPagoPayment}
              disabled={isProcessingPayment || cartItems.length === 0}
              className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3.5 px-4 rounded-md
                         transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] tracking-wider text-base uppercase
                         focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[var(--light-bg-alt)]
                         disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center`}
            >
              {isProcessingPayment ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </>
              ) : (
                'PAGAR CON MERCADO PAGO'
              )}
            </button>
            <Link 
                to="/" 
                className={`block w-full text-center mt-4 bg-transparent hover:bg-gray-200/70 text-[var(--text-dark-secondary)]
                            border border-gray-300/90 font-medium py-3 px-4 rounded-md
                            transition-colors duration-300 text-sm tracking-wider uppercase ${isProcessingPayment ? 'opacity-50 pointer-events-none' : ''}`}
            >
                Seguir Comprando
            </Link>
          </div>
        </div>
      </main>
      
      <footer className={`bg-[var(--light-bg-alt)]/70 border-t border-[${ACCENT_COLOR}]/30 text-[var(--text-dark-secondary)] py-8 text-center mt-12`}>
        <div className="container mx-auto px-6">
          <p className="tracking-wider text-sm uppercase">&copy; {new Date().getFullYear()} FASHION FLEX. PROCESO DE COMPRA SEGURO.</p>
        </div>
      </footer>
    </div>
  );
};

export default CheckoutPage;