import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart([]);
      setSubtotal(0);
      setShipping(0);
      setTotal(0);
      return;
    }
    try {
      setLoading(true);
      const res = await apiFetch('/cart');
      if (res.success) {
        setCart(res.cart || []);
        setSubtotal(res.subtotal || 0);
        setShipping(res.shipping || 0);
        setTotal(res.total || 0);
      }
    } catch (err) {
      console.warn('Fetch cart error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      return { success: false, message: 'Please login to add items to your cart.' };
    }
    try {
      const res = await apiFetch('/cart/add', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      });
      if (res.success) {
        setCart(res.cart);
        setSubtotal(res.subtotal);
        setShipping(res.shipping);
        setTotal(res.total);
      }
      return res;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await apiFetch('/cart/update', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      });
      if (res.success) {
        setCart(res.cart);
        setSubtotal(res.subtotal);
        setShipping(res.shipping);
        setTotal(res.total);
      }
      return res;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await apiFetch('/cart/remove', {
        method: 'POST',
        body: JSON.stringify({ productId }),
      });
      if (res.success) {
        setCart(res.cart);
        setSubtotal(res.subtotal);
        setShipping(res.shipping);
        setTotal(res.total);
      }
      return res;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const clearCart = async () => {
    try {
      const res = await apiFetch('/cart/clear', { method: 'POST' });
      if (res.success) {
        setCart([]);
        setSubtotal(0);
        setShipping(0);
        setTotal(0);
      }
      return res;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        subtotal,
        shipping,
        total,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
