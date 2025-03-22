import React, { createContext, useState, useContext, useEffect } from "react";

// Create the auth context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would check for an existing token and validate it
    // For this demo, we'll just simulate a logged-in user
    const mockUser = {
      id: "1",
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      role: "change_manager",
      avatar: null,
    };

    setTimeout(() => {
      setUser(mockUser);
      setLoading(false);
    }, 1000);
  }, []);

  // Login function
  const login = async (email, password) => {
    // In a real app, this would make an API call to authenticate
    // For this demo, we'll just simulate a successful login
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful login
      const mockUser = {
        id: "1",
        firstName: "Admin",
        lastName: "User",
        email,
        role: "change_manager",
        avatar: null,
      };

      setUser(mockUser);
      localStorage.setItem("authToken", "mock-jwt-token");
      return { success: true };
    } catch (error) {
      return { success: false, error: "Invalid credentials" };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("authToken");
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update user data
      setUser((prev) => ({ ...prev, ...userData }));
      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to update profile" };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
