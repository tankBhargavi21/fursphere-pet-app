import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }
    try {
      setLoading(true);
      const res = await apiFetch('/wishlist');
      if (res.success) {
        setWishlist(res.wishlist || []);
      }
    } catch (err) {
      console.warn('Fetch wishlist error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated]);

  const toggleWishlist = async (product) => {
    if (!isAuthenticated) {
      return { success: false, message: 'Please login to save favorite items.' };
    }
    const productId = product._id || product.id;
    try {
      const res = await apiFetch('/wishlist/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId }),
      });
      if (res.success) {
        setWishlist(res.wishlist || []);
      }
      return res;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => (item._id || item.id) === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        loading,
        toggleWishlist,
        isInWishlist,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
