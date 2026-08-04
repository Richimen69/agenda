// useAuth.js
import { useState, useEffect } from 'react';

export function useAuth() {
  const [authUser, setAuthUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('authUser');
    if (saved && saved !== "undefined") {
      try {
        setAuthUser(JSON.parse(saved));
      } catch (error) {
        console.error("authUser corrupto en localStorage, se limpia:", error);
        localStorage.removeItem('authUser');
        localStorage.removeItem('token');
      }
    }
    setIsCheckingAuth(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authUser');
    localStorage.removeItem('token');
    setAuthUser(null);
  };

  return { authUser, setAuthUser, isCheckingAuth, handleLogout };
}