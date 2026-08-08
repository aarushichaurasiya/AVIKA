import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../services/authService';
import { getToken, setToken, clearToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      if (!getToken()) { setLoading(false); return; }
      const res = await authService.me();
      if (res.ok) setUser(res.data.user);
      else clearToken(); // stale/expired token
      setLoading(false);
    }
    loadSession();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authService.login(email, password);
    if (res.ok) { setToken(res.data.token); setUser(res.data.user); }
    return res;
  }, []);

  const register = useCallback(async (name, email, password, role) => {
    const res = await authService.register(name, email, password, role);
    if (res.ok) { setToken(res.data.token); setUser(res.data.user); }
    return res;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isLoggedIn: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
