import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch, getAuthToken, setAuthToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('fursphere_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(getAuthToken());
  const [loading, setLoading] = useState(true);

  // Initialize and verify session
  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = getAuthToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await apiFetch('/auth/me');
        if (res.success && res.user) {
          setUser(res.user);
          localStorage.setItem('fursphere_user', JSON.stringify(res.user));
        }
      } catch (err) {
        console.warn('Session verification failed, logging out:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const loginWithPhoneOtp = async (phone, otp) => {
    const res = await apiFetch('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });

    if (res.success && res.token) {
      setAuthToken(res.token);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('fursphere_user', JSON.stringify(res.user));
    }
    return res;
  };

  const sendPhoneOtp = async (phone) => {
    return await apiFetch('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  };

  const loginWithPassword = async (identifier, password) => {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });

    if (res.success && res.token) {
      setAuthToken(res.token);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('fursphere_user', JSON.stringify(res.user));
    }
    return res;
  };

  const loginAdmin = async (email, password) => {
    const res = await apiFetch('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.token) {
      setAuthToken(res.token);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('fursphere_user', JSON.stringify(res.user));
    }
    return res;
  };

  const register = async ({ name, email, phone, password }) => {
    const res = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, password }),
    });

    if (res.success && res.token) {
      setAuthToken(res.token);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('fursphere_user', JSON.stringify(res.user));
    }
    return res;
  };

  const logout = () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
    localStorage.removeItem('fursphere_user');
  };

  const updateProfile = async (data) => {
    const res = await apiFetch('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (res.success && res.user) {
      setUser(res.user);
      localStorage.setItem('fursphere_user', JSON.stringify(res.user));
    }
    return res;
  };

  const addAddress = async (addressData) => {
    const res = await apiFetch('/auth/address', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
    if (res.success && res.addresses) {
      setUser((prev) => {
        const updated = { ...prev, addresses: res.addresses };
        localStorage.setItem('fursphere_user', JSON.stringify(updated));
        return updated;
      });
    }
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        loginWithPhoneOtp,
        sendPhoneOtp,
        loginWithPassword,
        loginAdmin,
        register,
        logout,
        updateProfile,
        addAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
