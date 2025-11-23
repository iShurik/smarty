import axios from 'axios';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);
const TOKEN_STORAGE_KEY = 'authToken';

function setAxiosAuthHeader(token) {
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common.Authorization;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setAxiosAuthHeader(token);

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    async function fetchUser() {
      try {
        const { data } = await axios.get('/api/v1/auth/me');
        setUser(data.user);
      } catch (error) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [token]);

  const persistSession = (newToken, newUser) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
    setAxiosAuthHeader(newToken);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      async register({ name, email, password, password_confirmation, role }) {
        const { data } = await axios.post('/api/v1/auth/register', {
          name,
          email,
          password,
          password_confirmation,
          role,
        });

        persistSession(data.token, data.user);

        return data.user;
      },
      async login({ email, password }) {
        const { data } = await axios.post('/api/v1/auth/login', {
          email,
          password,
        });

        persistSession(data.token, data.user);

        return data.user;
      },
      async logout() {
        try {
          await axios.post('/api/v1/auth/logout');
        } catch (error) {
          // ignore logout errors
        }

        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
        setAxiosAuthHeader(null);
      },
    }),
    [loading, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}