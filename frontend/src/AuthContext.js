import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch, setToken, clearToken, getToken } from './config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // true while checking for a saved session

  // On app start, check if a token is already saved and fetch the profile it belongs to
  useEffect(() => {
    const loadSession = async () => {
      const token = await getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const profile = await apiFetch('/auth/profile');
        setUser(profile);
      } catch (err) {
        // Token expired or invalid - clear it and treat as logged out
        await clearToken();
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  const register = async (name, email, password) => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: { name, email, password },
    });
    await setToken(data.token);
    setUser(data.user);
    return data;
  };

  const login = async (email, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    await setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await clearToken();
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const updated = await apiFetch('/auth/profile', { method: 'PUT', body: updates });
    setUser((prev) => ({ ...prev, ...updated }));
    return updated;
  };

  const changePassword = async (currentPassword, newPassword) => {
    return apiFetch('/auth/change-password', {
      method: 'PUT',
      body: { currentPassword, newPassword },
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);