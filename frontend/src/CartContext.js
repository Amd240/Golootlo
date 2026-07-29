import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { apiFetch } from './config/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x400.png?text=Golootlo';
const CACHE_KEY = 'shopease_offline_cart';
const QUEUE_KEY = 'shopease_cart_pending_actions';

// Backend cart items look like { product: {...}, quantity }. Flatten them into
// the same shape the existing Cart/ProductDetail screens were built around,
// so those screens barely need to change.
const flattenCart = (backendCart) =>
  (backendCart?.items || []).map((item) => ({
    id: item.product._id,
    name: item.product.name,
    price: item.product.price,
    image: (item.product.images && item.product.images[0]) || PLACEHOLDER_IMAGE,
    quantity: item.quantity,
  }));

// A network-layer failure (no connection, request never reached the server) vs.
// a real API error response (400/500 etc, which DOES have a message from the server).
const isNetworkError = (err) =>
  err instanceof TypeError || /network/i.test(err?.message || '');

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const syncingRef = useRef(false);

  const persistCache = useCallback(async (items) => {
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(items));
    } catch (err) {
      // Best-effort cache — not critical if it fails
    }
  }, []);

  const getQueue = async () => {
    try {
      const raw = await AsyncStorage.getItem(QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  };

  const setQueue = async (queue) => {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    setPendingCount(queue.length);
  };

  const enqueueAction = async (action) => {
    const queue = await getQueue();
    queue.push(action);
    await setQueue(queue);
  };

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await apiFetch('/cart');
      const flat = flattenCart(data);
      setCart(flat);
      setIsOffline(false);
      persistCache(flat);
    } catch (err) {
      if (isNetworkError(err)) {
        // No connection — fall back to whatever we last saw, so the cart
        // isn't just blank while offline.
        setIsOffline(true);
        try {
          const cached = await AsyncStorage.getItem(CACHE_KEY);
          if (cached) setCart(JSON.parse(cached));
        } catch (cacheErr) {
          // Ignore — worst case the cart shows empty until back online
        }
      } else {
        console.warn('Failed to load cart:', err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, persistCache]);

  // Replays queued offline actions against the real API, in the order they
  // happened, then reconciles with a fresh server fetch.
  const syncPendingActions = useCallback(async () => {
    if (syncingRef.current) return;
    const queue = await getQueue();
    if (queue.length === 0) return;

    syncingRef.current = true;
    try {
      for (const action of queue) {
        try {
          if (action.type === 'add') {
            await apiFetch('/cart', { method: 'POST', body: { productId: action.productId, quantity: action.quantity } });
          } else if (action.type === 'update') {
            await apiFetch(`/cart/${action.productId}`, { method: 'PUT', body: { quantity: action.quantity } });
          } else if (action.type === 'remove') {
            await apiFetch(`/cart/${action.productId}`, { method: 'DELETE' });
          } else if (action.type === 'clear') {
            await apiFetch('/cart', { method: 'DELETE' });
          }
        } catch (err) {
          // If a single queued action fails for a real (non-network) reason,
          // skip it rather than blocking the rest of the queue forever.
          if (isNetworkError(err)) throw err; // still offline — stop and retry later
        }
      }
      await setQueue([]);
      setIsOffline(false);
      await refreshCart();
    } catch (err) {
      // Still offline (or the retry loop hit a network error) — leave the
      // queue intact, we'll try again on the next reconnect event.
    } finally {
      syncingRef.current = false;
    }
  }, [refreshCart]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
      getQueue().then((q) => setPendingCount(q.length));
    } else {
      setCart([]); // clear out the previous user's cart on logout
    }
  }, [isAuthenticated, refreshCart]);

  // Watch connectivity and flush the queue the moment we're back online
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = !!state.isConnected && state.isInternetReachable !== false;
      if (online && isAuthenticated) {
        syncPendingActions();
      }
    });
    return () => unsubscribe();
  }, [isAuthenticated, syncPendingActions]);

  const addToCart = async (product, quantity = 1) => {
    try {
      const data = await apiFetch('/cart', { method: 'POST', body: { productId: product.id, quantity } });
      const flat = flattenCart(data);
      setCart(flat);
      persistCache(flat);
    } catch (err) {
      if (!isNetworkError(err)) {
        console.warn('Failed to add to cart:', err.message);
        return;
      }
      // Offline — apply the change locally so the UI stays responsive, and
      // queue it to replay against the server once we're back online.
      setIsOffline(true);
      setCart((prev) => {
        const existing = prev.find((i) => i.id === product.id);
        const next = existing
          ? prev.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i))
          : [...prev, { id: product.id, name: product.name, price: product.price, image: product.image, quantity }];
        persistCache(next);
        return next;
      });
      await enqueueAction({ type: 'add', productId: product.id, quantity });
    }
  };

  const removeFromCart = async (id) => {
    try {
      const data = await apiFetch(`/cart/${id}`, { method: 'DELETE' });
      const flat = flattenCart(data);
      setCart(flat);
      persistCache(flat);
    } catch (err) {
      if (!isNetworkError(err)) {
        console.warn('Failed to remove from cart:', err.message);
        return;
      }
      setIsOffline(true);
      setCart((prev) => {
        const next = prev.filter((i) => i.id !== id);
        persistCache(next);
        return next;
      });
      await enqueueAction({ type: 'remove', productId: id });
    }
  };

  const updateQuantity = async (id, quantity) => {
    if (quantity < 1) return removeFromCart(id);
    try {
      const data = await apiFetch(`/cart/${id}`, { method: 'PUT', body: { quantity } });
      const flat = flattenCart(data);
      setCart(flat);
      persistCache(flat);
    } catch (err) {
      if (!isNetworkError(err)) {
        console.warn('Failed to update quantity:', err.message);
        return;
      }
      setIsOffline(true);
      setCart((prev) => {
        const next = prev.map((i) => (i.id === id ? { ...i, quantity } : i));
        persistCache(next);
        return next;
      });
      await enqueueAction({ type: 'update', productId: id, quantity });
    }
  };

  const clearCart = async () => {
    try {
      const data = await apiFetch('/cart', { method: 'DELETE' });
      const flat = flattenCart(data);
      setCart(flat);
      persistCache(flat);
    } catch (err) {
      if (!isNetworkError(err)) {
        console.warn('Failed to clear cart:', err.message);
        return;
      }
      setIsOffline(true);
      setCart([]);
      persistCache([]);
      await enqueueAction({ type: 'clear' });
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart, loading, addToCart, removeFromCart, updateQuantity, clearCart,
        cartTotal, cartCount, refreshCart, isOffline, pendingCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
