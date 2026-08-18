import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      setUser(res.data.user);
      return res.data;
    }
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData, {
      headers: {
        'Content-Type': formData instanceof FormData ? 'multipart/form-data' : 'application/json',
      },
    });
    if (res.data.success) {
      setUser(res.data.user);
      return res.data;
    }
  };

  const updateProfile = async (profileData) => {
    const res = await api.put('/auth/profile', profileData);
    if (res.data.success) {
      setUser(res.data.user);
      return res.data;
    }
  };

  const uploadProfilePhoto = async (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    const res = await api.post('/auth/profile-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (res.data.success) {
      setUser(res.data.user);
      return res.data;
    }
  };

  const removeProfilePhoto = async () => {
    const res = await api.delete('/auth/profile-photo');
    if (res.data.success) {
      setUser(res.data.user);
      return res.data;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error(err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        checkUser,
        updateProfile,
        uploadProfilePhoto,
        removeProfilePhoto,
        isAuthenticated: !!user,
        isOrganizer: user?.role === 'ORGANIZER' || user?.role === 'ADMIN',
        isPlayer: user?.role === 'PLAYER',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
