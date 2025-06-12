import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ProductItem, CartItem } from '../types';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: ProductItem, quantity: number, selectedSize?: string, selectedVolume?: number, selectedPrice?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => string;
  getTotalItems: () => number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const generateCartItemId = (productId: string, size?: string, volume?: number): string => {
  let id = productId;
  if (size) id += `_size_${size.replace(/\s+/g, '-')}`;
  if (volume) id += `_vol_${volume}`; // Note: if volume can be 0 and that's distinct, this logic might need adjustment. Assume volume > 0.
  return id;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const localData = localStorage.getItem('sportFlexCart');
      console.log('CartContext: Initializing cart from localStorage:', localData); // DEBUG
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      console.log('CartContext: Saving cart to localStorage:', cartItems); // DEBUG
      localStorage.setItem('sportFlexCart', JSON.stringify(cartItems));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [cartItems]);

  const addToCart = useCallback((item: ProductItem, quantity: number, selectedSize?: string, selectedVolume?: number, selectedPrice?: string) => {
    console.log('CartContext: addToCart called with item:', item.id, 'size:', selectedSize, 'volume:', selectedVolume, 'price:', selectedPrice, 'qty:', quantity); // DEBUG
    setCartItems(prevItems => {
      console.log('CartContext: addToCart - prevItems:', prevItems); // DEBUG
      const cartItemId = generateCartItemId(item.id, selectedSize, selectedVolume);
      const existingItemIndex = prevItems.findIndex(i => i.cartItemId === cartItemId);

      let newItems;
      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        const currentItem = updatedItems[existingItemIndex];
        updatedItems[existingItemIndex] = {
          ...currentItem,
          quantity: currentItem.quantity + quantity,
          selectedPrice: selectedPrice || currentItem.selectedPrice,
        };
        newItems = updatedItems;
        console.log('CartContext: Updating item', cartItemId, 'Resulting cart:', newItems); // DEBUG
      } else {
        const newItemToAdd = {
          ...item,
          cartItemId,
          quantity,
          selectedSize,
          selectedVolume,
          selectedPrice: selectedPrice || item.price
        };
        newItems = [...prevItems, newItemToAdd];
        console.log('CartContext: Adding new item', cartItemId, 'Resulting cart:', newItems); // DEBUG
      }
      return newItems;
    });
  }, []);

  const removeFromCart = useCallback((cartItemId: string) => {
    console.log('CartContext: removeFromCart called for cartItemId:', cartItemId); // DEBUG
    setCartItems(prevItems => {
      console.log('CartContext: removeFromCart - prevItems:', prevItems); // DEBUG
      const newItems = prevItems.filter(item => item.cartItemId !== cartItemId);
      console.log('CartContext: removeFromCart - resulting cart:', newItems); // DEBUG
      return newItems;
    });
  }, []);

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    console.log('CartContext: updateQuantity called for cartItemId:', cartItemId, 'new quantity:', quantity); // DEBUG
    setCartItems(prevItems => {
      console.log('CartContext: updateQuantity - prevItems:', prevItems); // DEBUG
      const newItems = prevItems
        .map(item =>
          item.cartItemId === cartItemId ? { ...item, quantity: Math.max(0, quantity) } : item
        )
        .filter(item => item.quantity > 0);
      console.log('CartContext: updateQuantity - resulting cart:', newItems); // DEBUG
      return newItems;
    });
  }, []);

  const clearCart = useCallback(() => {
    console.log('CartContext: clearCart called'); // DEBUG
    setCartItems([]);
  }, []);

  const getCartTotal = useCallback((): string => {
    const total = cartItems.reduce((sum, item) => {
      const priceNumber = parseFloat(item.selectedPrice.replace('$', '').replace(',', ''));
      return sum + (priceNumber * item.quantity);
    }, 0);
    return `$${total.toFixed(2)}`;
  }, [cartItems]);

  const getTotalItems = useCallback((): number => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const openCart = useCallback(() => {
    console.log('CartContext: openCart called'); // DEBUG
    setIsCartOpen(true);
  }, []);
  const closeCart = useCallback(() => {
    console.log('CartContext: closeCart called'); // DEBUG
    setIsCartOpen(false);
  }, []);
  const toggleCart = useCallback(() => {
    console.log('CartContext: toggleCart called'); // DEBUG
    setIsCartOpen(prev => !prev);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getTotalItems,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

