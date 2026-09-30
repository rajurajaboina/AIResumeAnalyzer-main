import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await authAPI.login(email, password);
    const { token, userId, name, email: userEmail } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ userId, name, email: userEmail }));
    setUser({ userId, name, email: userEmail });
    return response.data;
  };

  const register = async (name, email, password) => {
    const response = await authAPI.register(name, email, password);
    const { token, userId, name: userName, email: userEmail } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ userId, name: userName, email: userEmail }));
    setUser({ userId, name: userName, email: userEmail });
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
