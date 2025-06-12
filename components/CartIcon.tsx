import React from 'react';
import { useCart } from '../contexts/CartContext';

const CartIcon: React.FC = () => {
  const { getTotalItems, toggleCart } = useCart();
  const totalItems = getTotalItems();

  return (
    <button
      onClick={toggleCart}
      className="relative flex items-center justify-center p-2 rounded-full hover:bg-[var(--accent-color-primary)]/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color-primary)]/50"
      aria-label={`Carrito de compras, ${totalItems} artículos`}
      aria-haspopup="dialog"
      aria-controls="cart-sidebar"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
        className="w-6 h-6 text-[var(--accent-color-primary)] group-hover:text-white"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
        />
      </svg>
      {totalItems > 0 && (
        <span
          className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full"
          aria-hidden="true"
        >
          {totalItems}
        </span>
      )}
    </button>
  );
};

export default CartIcon;