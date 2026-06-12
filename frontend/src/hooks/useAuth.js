import { useState, useEffect } from 'react';

export function useAuth() {
  const [authUser, setAuthUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('authUser');
    if (saved) setAuthUser(JSON.parse(saved));
    setIsCheckingAuth(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authUser');
    setAuthUser(null);
  };

  return { authUser, setAuthUser, isCheckingAuth, handleLogout };
}