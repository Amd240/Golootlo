import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProducts } from './ProductsContext';

const RecentlyViewedContext = createContext();

const STORAGE_KEY = 'shopease_recently_viewed';
const MAX_ITEMS = 10;

export const RecentlyViewedProvider = ({ children }) => {
  const { products } = useProducts();
  const [viewedIds, setViewedIds] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Load persisted IDs once on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setViewedIds(JSON.parse(stored));
      } catch (err) {
        // Ignore — recently viewed is a nice-to-have, not core functionality
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const trackView = useCallback((productId) => {
    setViewedIds((prev) => {
      const next = [productId, ...prev.filter((id) => id !== productId)].slice(0, MAX_ITEMS);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setViewedIds([]);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  // Resolve IDs to full product objects, preserving most-recent-first order,
  // and dropping any that no longer exist in the catalog.
  const recentlyViewed = viewedIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean);

  return (
    <RecentlyViewedContext.Provider value={{ recentlyViewed, trackView, clearRecentlyViewed, loaded }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
};

export const useRecentlyViewed = () => useContext(RecentlyViewedContext);
