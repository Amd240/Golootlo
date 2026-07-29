import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch } from './config/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x400.png?text=Golootlo';

// Backend wishlist looks like { products: [...] }. Flatten into the same
// product shape used elsewhere in the app.
const flattenWishlist = (backendWishlist) =>
  (backendWishlist?.products || []).map((p) => ({
    id: p._id,
    name: p.name,
    price: p.price,
    image: (p.images && p.images[0]) || PLACEHOLDER_IMAGE,
    category: p.category?.name || 'Uncategorized',
    rating: p.rating ?? 0,
  }));

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await apiFetch('/wishlist');
      setWishlist(flattenWishlist(data));
    } catch (err) {
      console.warn('Failed to load wishlist:', err.message);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshWishlist();
    } else {
      setWishlist([]); // clear out the previous user's wishlist on logout
    }
  }, [isAuthenticated, refreshWishlist]);

  const addToWishlist = async (product) => {
    try {
      const data = await apiFetch('/wishlist', { method: 'POST', body: { productId: product.id } });
      setWishlist(flattenWishlist(data));
    } catch (err) {
      console.warn('Failed to add to wishlist:', err.message);
    }
  };

  const removeFromWishlist = async (id) => {
    try {
      const data = await apiFetch(`/wishlist/${id}`, { method: 'DELETE' });
      setWishlist(flattenWishlist(data));
    } catch (err) {
      console.warn('Failed to remove from wishlist:', err.message);
    }
  };

  const isWishlisted = (id) => wishlist.some((item) => item.id === id);

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isWishlisted, refreshWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
