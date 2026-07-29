import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiFetch } from './config/api';

const ProductsContext = createContext();

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x400.png?text=Golootlo';

// Normalize a backend product (category populated as {_id, name, icon}) into the
// flat shape the existing screens were built around: id, image, category (string).
const normalizeProduct = (p) => ({
  id: p._id,
  name: p.name,
  price: p.price,
  image: (p.images && p.images[0]) || PLACEHOLDER_IMAGE,
  images: p.images || [],
  category: p.category?.name || 'Uncategorized',
  categoryId: p.category?._id || null,
  rating: p.rating ?? 0,
  stock: p.stock,
  description: p.description || '',
});

const normalizeCategory = (c) => ({
  id: c._id,
  name: c.name,
  icon: c.icon || '',
});

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsData, categoriesData] = await Promise.all([
        apiFetch('/products'),
        apiFetch('/categories'),
      ]);
      setProducts(productsData.map(normalizeProduct));
      setCategories(categoriesData.map(normalizeCategory));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const getProductsByCategory = (categoryName) =>
    products.filter((p) => p.category.toLowerCase() === (categoryName || '').toLowerCase());

  const getProductById = (id) => products.find((p) => p.id === id);

  // "Featured" isn't a field the backend tracks - use the highest rated products instead.
  const featuredProducts = [...products].sort((a, b) => b.rating - a.rating).slice(0, 6);

  return (
    <ProductsContext.Provider
      value={{
        products,
        categories,
        featuredProducts,
        loading,
        error,
        refetch: fetchAll,
        getProductsByCategory,
        getProductById,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => useContext(ProductsContext);
