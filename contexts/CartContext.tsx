import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ProductItem, CartItem } from '../types';
import { useCatalog } from './CatalogDataContext'; // Import useCatalog

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: ProductItem, quantity: number, selectedSize?: string, selectedVolume?: number, selectedPrice?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  processOrderAndClearCart: () => void;
  clearCart: () => void; // Added clearCart specifically for emptying
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
  if (volume) id += `_vol_${volume}`;
  return id;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const localData = localStorage.getItem('sportFlexCart');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { decrementStock, getProductById } = useCatalog(); 

  useEffect(() => {
    try {
      localStorage.setItem('sportFlexCart', JSON.stringify(cartItems));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [cartItems]);

  const addToCart = useCallback((item: ProductItem, quantity: number, selectedSize?: string, selectedVolume?: number, selectedPrice?: string) => {
    
    const productInCatalog = getProductById(item.id);
    if (!productInCatalog || productInCatalog.stock < quantity) {
        alert(`No hay suficiente stock para ${item.name}. Disponible: ${productInCatalog?.stock || 0}`);
        return;
    }

    setCartItems(prevItems => {
      const cartItemId = generateCartItemId(item.id, selectedSize, selectedVolume);
      const existingItemIndex = prevItems.findIndex(i => i.cartItemId === cartItemId);

      let newItems;
      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        const currentItem = updatedItems[existingItemIndex];
        const newQuantity = currentItem.quantity + quantity;

        if (productInCatalog && productInCatalog.stock < newQuantity) {
            alert(`No hay suficiente stock para ${item.name}. Disponible: ${productInCatalog.stock}, En carrito ya: ${currentItem.quantity}`);
            return prevItems; 
        }

        updatedItems[existingItemIndex] = {
          ...currentItem,
          quantity: newQuantity,
          selectedPrice: selectedPrice || currentItem.selectedPrice,
        };
        newItems = updatedItems;
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
      }
      return newItems;
    });
  }, [getProductById]);

  const removeFromCart = useCallback((cartItemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.cartItemId !== cartItemId));
  }, []);

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    setCartItems(prevItems => {
        const itemToUpdate = prevItems.find(item => item.cartItemId === cartItemId);
        if (itemToUpdate) {
            const productInCatalog = getProductById(itemToUpdate.id);
            if (productInCatalog && productInCatalog.stock < quantity) {
                alert(`No hay suficiente stock para ${itemToUpdate.name}. Máximo disponible: ${productInCatalog.stock}`);
                 return prevItems.map(item =>
                    item.cartItemId === cartItemId ? { ...item, quantity: Math.max(0, productInCatalog.stock) } : item
                ).filter(item => item.quantity > 0);
            }
        }

        return prevItems
            .map(item =>
            item.cartItemId === cartItemId ? { ...item, quantity: Math.max(0, quantity) } : item
            )
            .filter(item => item.quantity > 0);
    });
  }, [getProductById]);

  const processOrderAndClearCart = useCallback(() => {
    console.log('CartContext: processOrderAndClearCart called');
    cartItems.forEach(item => {
      console.log(`CartContext: Decrementing stock for ${item.name} (ID: ${item.id}), Qty: ${item.quantity}`);
      decrementStock(item.id, item.quantity, item.selectedSize, item.selectedVolume);
    });
    setCartItems([]);
  }, [cartItems, decrementStock]);

  const clearCart = useCallback(() => {
    setCartItems([]); // Just clear items without stock decrement
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

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen(prev => !prev), []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        processOrderAndClearCart,
        clearCart, // Added to provider
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