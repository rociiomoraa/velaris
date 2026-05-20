// ================================================================
// VELARIS — AuthContext (src/context/AuthContext.jsx)
// ================================================================
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authApi } from '../api/client';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const t = localStorage.getItem('velaris_token');
      const u = JSON.parse(localStorage.getItem('velaris_user') || 'null');
      if (t && u) { setToken(t); setUser(u); }
    } catch {}
    setReady(true);
  }, []);

  const login = useCallback(async (body) => {
    const { data } = await authApi.login(body);
    localStorage.setItem('velaris_token', data.token);
    localStorage.setItem('velaris_user', JSON.stringify(data));
    setToken(data.token); setUser(data);
    return data;
  }, []);

  const register = useCallback(async (body) => {
    const { data } = await authApi.register(body);
    localStorage.setItem('velaris_token', data.token);
    localStorage.setItem('velaris_user', JSON.stringify(data));
    setToken(data.token); setUser(data);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('velaris_token');
    localStorage.removeItem('velaris_user');
    setToken(null); setUser(null);
  }, []);

  return (
    <Ctx.Provider value={{
      user, token, ready,
      isAuth: !!token,
      isAdmin: user?.role === 'ADMIN',
      login, register, logout
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
