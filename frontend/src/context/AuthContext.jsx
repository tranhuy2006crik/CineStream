import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activeProfile, setActiveProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');
      const savedProfile = localStorage.getItem('activeProfile');
      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      }
      if (savedProfile) setActiveProfile(JSON.parse(savedProfile));
    } catch (e) {
      console.error('Auth init error:', e);
    }
    setLoading(false);
  }, []);

  const login = useCallback((userData, userToken, profile = null) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
    setUser(userData);
    setToken(userToken);
    if (profile) {
      localStorage.setItem('activeProfile', JSON.stringify(profile));
      setActiveProfile(profile);
    } else if (userData.profiles?.[0]) {
      localStorage.setItem('activeProfile', JSON.stringify(userData.profiles[0]));
      setActiveProfile(userData.profiles[0]);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('activeProfile');
    setUser(null);
    setToken(null);
    setActiveProfile(null);
  }, []);

  const setProfile = useCallback((profile) => {
    if (profile) {
      localStorage.setItem('activeProfile', JSON.stringify(profile));
      setActiveProfile(profile);
    } else {
      localStorage.removeItem('activeProfile');
      setActiveProfile(null);
    }
  }, []);

  const updateUser = useCallback((userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const isAuthenticated = !!(token && user);
  const isAdmin = user?.role === 'admin' || user?.role === 'staff';

  return (
    <AuthContext.Provider value={{
      user, token, activeProfile, loading,
      login, logout, setProfile, updateUser,
      isAuthenticated, isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default useAuth;
