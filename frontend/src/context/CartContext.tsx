import React, { createContext, useContext, useState, useEffect } from 'react';
import { Crop } from '@/services/cropApi';

export interface CartItem {
  crop: Crop;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (crop: Crop, quantity?: number) => void;
  removeFromCart: (cropId: number) => void;
  updateQuantity: (cropId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Load cart from localStorage on initialization
    try {
      if (typeof window !== 'undefined') {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
    return [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('cart', JSON.stringify(items));
      }
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [items]);

  const addToCart = (crop: Crop, quantity: number = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.crop.id === crop.id);

      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map((item) =>
          item.crop.id === crop.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, crop.quantity) }
            : item
        );
      } else {
        // Add new item
        return [...prevItems, { crop, quantity: Math.min(quantity, crop.quantity) }];
      }
    });
  };

  const removeFromCart = (cropId: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.crop.id !== cropId));
  };

  const updateQuantity = (cropId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cropId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.crop.id === cropId
          ? { ...item, quantity: Math.min(quantity, item.crop.quantity) }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.crop.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
