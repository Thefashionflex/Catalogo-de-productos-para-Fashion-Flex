import React from 'react';
import { useCart } from '../contexts/CartContext';
import { CartItem } from '../types';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate

const ACCENT_COLOR = 'var(--accent-color-primary)';

const CartSidebar: React.FC = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    isCartOpen,
    closeCart,
  } = useCart();
  const navigate = useNavigate(); // Hook para navegación

  const handleQuantityChange = (item: CartItem, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(item.cartItemId);
    } else {
      updateQuantity(item.cartItemId, newQuantity);
    }
  };

  const handleProceedToCheckout = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    navigate('/checkout');
    closeCart();
  };

  return (
    <>
      {/* Overlay */}
      {isCartOpen && (
        <div
          onClick={closeCart}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] transition-opacity duration-300 ease-in-out"
          aria-hidden="true"
        ></div>
      )}

      {/* Sidebar */}
      <aside
        id="cart-sidebar"
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-[var(--light-bg-alt)] shadow-xl transform transition-transform duration-300 ease-in-out z-[60] flex flex-col
                   ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-sidebar-title"
      >
        {/* Header */}
        <header className={`flex items-center justify-between p-5 border-b border-[${ACCENT_COLOR}]/30 bg-[var(--light-bg)]`}>
          <h2 id="cart-sidebar-title" className={`text-xl font-semibold text-[${ACCENT_COLOR}] tracking-wider uppercase`}>
            Mi Carrito
          </h2>
          <button
            onClick={closeCart}
            className={`p-1.5 rounded-full text-[var(--text-dark-secondary)] hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[${ACCENT_COLOR}]/50`}
            aria-label="Cerrar carrito"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Cart Items */}
        <div className="flex-grow p-5 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--accent-color-primary)] scrollbar-track-gray-100">
          {cartItems.length === 0 ? (
            <p className="text-center text-[var(--text-dark-secondary)] mt-10 uppercase">Tu carrito está vacío.</p>
          ) : (
            <ul className="space-y-4">
              {cartItems.map((item) => (
                <li key={item.cartItemId} className="flex items-start space-x-4 p-3 bg-white rounded-lg border border-gray-200/80 shadow-sm">
                  <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-md border border-gray-200" />
                  <div className="flex-grow">
                    <h3 className="text-sm font-medium text-[var(--text-dark-primary)]">{item.name}</h3>
                    {(item.selectedSize || item.selectedVolume) && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.selectedSize && `Talla: ${item.selectedSize}`}
                        {item.selectedSize && item.selectedVolume && ', '}
                        {item.selectedVolume && `Vol: ${item.selectedVolume}ML`}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-[var(--accent-color-primary)] mt-1">{item.selectedPrice}</p>
                    <div className="flex items-center mt-2 space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item, item.quantity - 1)}
                        className="px-2 py-0.5 border border-gray-300 rounded text-[var(--text-dark-secondary)] hover:bg-gray-100 disabled:opacity-50"
                        aria-label={`Disminuir cantidad de ${item.name}`}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item, item.quantity + 1)}
                        className="px-2 py-0.5 border border-gray-300 rounded text-[var(--text-dark-secondary)] hover:bg-gray-100"
                         aria-label={`Aumentar cantidad de ${item.name}`}
                      >
                        +
                      </button>
                       <button
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="ml-auto text-xs text-red-500 hover:text-red-700 hover:underline uppercase"
                        aria-label={`Eliminar ${item.name} del carrito`}
                       >
                        Eliminar
                       </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <footer className={`p-5 border-t border-[${ACCENT_COLOR}]/30 bg-[var(--light-bg)] space-y-4`}>
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-[var(--text-dark-primary)] uppercase">Subtotal:</span>
              <span className={`text-xl font-bold text-[${ACCENT_COLOR}]`}>{getCartTotal()}</span>
            </div>
            <button
              onClick={handleProceedToCheckout} // Actualizado para usar la nueva función
              className={`w-full bg-[${ACCENT_COLOR}] hover:bg-opacity-90 text-white font-bold py-3 px-4 rounded-md
                         transition-colors duration-300 tracking-wider text-sm uppercase`}
            >
              Proceder al Pago
            </button>
            <button
              onClick={clearCart}
              className={`w-full bg-transparent hover:bg-gray-200 text-[var(--text-dark-secondary)]
                         border border-gray-300 font-medium py-2.5 px-4 rounded-md
                         transition-colors duration-300 text-sm tracking-wider uppercase`}
            >
              Vaciar Carrito
            </button>
          </footer>
        )}
      </aside>
    </>
  );
};

export default CartSidebar;