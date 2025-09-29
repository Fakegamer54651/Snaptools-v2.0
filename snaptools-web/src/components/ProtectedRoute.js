import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authStore } from '../store/auth.store';

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(authStore.isAuthenticated());

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authStore.subscribe((authState) => {
      setIsAuthenticated(authState.isAuthenticated);
    });

    return unsubscribe;
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}
