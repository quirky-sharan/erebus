import React, { createContext, useContext, useEffect, useState } from 'react';
import { subscribeToAuthChanges, signInWithGoogle, signOut } from '../firebase/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : (
        <div className="min-h-screen bg-void flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-cobalt/20 border-t-cobalt rounded-full animate-spin"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
};
