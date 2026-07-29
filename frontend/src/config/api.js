// Central place for your backend URL and a fetch wrapper that automatically
// attaches the JWT token (if present) and parses JSON responses.

import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANT: replace this with your computer's local network IP, e.g. "http://192.168.1.5:5000/api"
// Find it on Windows with: ipconfig  (look for "IPv4 Address")
// Your phone and laptop must be on the same Wi-Fi network.
export const API_URL = 'http://localhost:5000/api';

const TOKEN_KEY = 'shopease_token';

export const getToken = () => AsyncStorage.getItem(TOKEN_KEY);
export const setToken = (token) => AsyncStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => AsyncStorage.removeItem(TOKEN_KEY);

/**
 * apiFetch('/products') -> GET
 * apiFetch('/auth/login', { method: 'POST', body: { email, password } })
 * Automatically attaches Authorization header if a token is stored,
 * stringifies JSON bodies, and throws with the server's error message on failure.
 */
export const apiFetch = async (path, options = {}) => {
  const token = await getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong. Please try again.');
  }

  return data;
};
