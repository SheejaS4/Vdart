import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/profile/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
        } else {
          localStorage.removeItem('token');
        }
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        body: userData // FormData for file upload
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.tokens.access);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: { message: 'An unexpected error occurred during registration' }
      };
    }
  };

  const login = async (credentials) => {
    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (data.access) {
        localStorage.setItem('token', data.access);
        await fetchUserProfile();  // Fetch user info after login
        return { success: true };
      } else {
        return { success: false, error: { message: 'Login failed' } };
      }

    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: { message: 'An unexpected error occurred during login' }
      };
    }
  };

  const updateProfile = async (userData) => {
    try {
      const response = await fetch('http://localhost:8000/api/profile/', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: userData // FormData for file upload
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { 
        success: false, 
        error: { message: 'An unexpected error occurred while updating profile' }
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 