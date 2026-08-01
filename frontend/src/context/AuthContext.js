import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

// Ensure this matches your running backend port (5001)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Safely initialize user state
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser || savedUser === 'undefined' || savedUser === 'null') return null;
    try {
      return JSON.parse(savedUser);
    } catch (e) {
      return null;
    }
  });

  // Safely initialize token state
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken || savedToken === 'undefined' || savedToken === 'null') return null;
    return savedToken;
  });

  // LOGIN FUNCTION
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      const { user: userData, token: authToken } = response.data;

      setUser(userData);
      setToken(authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', authToken);

      setLoading(false);
      return true; // Navigation trigger for Login.js
    } catch (err) {
      setLoading(false);
      const message = err.response?.data?.error || err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(message);
      return false;
    }
  };

  // REGISTER FUNCTION (Handles both object or separate parameters)
  const register = async (param1, emailArg, passwordArg, profileImageArg) => {
    setLoading(true);
    setError(null);
    try {
      let payload = {};

      if (typeof param1 === 'object' && param1 !== null) {
        // Called as register({ name, email, password, profile_image })
        payload = param1;
      } else {
        // Called as register(name, email, password, profile_image)
        payload = {
          name: param1,
          full_name: param1,
          email: emailArg,
          password: passwordArg,
          profile_image: profileImageArg
        };
      }

      const response = await axios.post(`${API_URL}/register`, payload);
      const { user: userData, token: authToken } = response.data;

      setUser(userData);
      setToken(authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', authToken);

      setLoading(false);
      return true;
    } catch (err) {
      setLoading(false);
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Registration failed. Please try again.';
      setError(message);
      return false;
    }
  };

  // LOGOUT FUNCTION
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, error, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};