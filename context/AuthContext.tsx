"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getUserProfile, refreshAccessToken } from "@/lib/authService";
import { useAppDispatch } from "@/lib/store/hooks";
import { setCredentials, logout as logoutAction, setAuthLoading } from "@/lib/store/slices/authSlice";
import { clearAuthTokens, getAccessToken, getRefreshToken, setAuthTokens } from "@/lib/tokenStorage";

interface User {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  profilePictureUrl?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string, refreshToken: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useAppDispatch();

  const fetchUser = async (token: string) => {
    try {
      dispatch(setAuthLoading(true));
      setIsLoading(true);
      
      const userData = await getUserProfile();

      // Get the latest token (in case it was refreshed during the getUserProfile call)
      const latestToken = getAccessToken() || token;

      // Sync with Redux Store
      dispatch(setCredentials({ user: userData, accessToken: latestToken }));
      setUser(userData);
      sessionStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      logout();
    } finally {
      dispatch(setAuthLoading(false));
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();
      const refreshToken = getRefreshToken();

      if (token) {
        await fetchUser(token);
      } else if (refreshToken) {
        try {
          // Access token missing, try to refresh using the refresh token
          const newToken = await refreshAccessToken();
          await fetchUser(newToken);
        } catch (error) {
          console.error("Auto-refresh failed during init:", error);
          logout();
        }
      } else {
        dispatch(setAuthLoading(false));
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (token: string, refreshToken: string) => {
    setAuthTokens(token, refreshToken);
    await fetchUser(token);
  };

  const refreshUser = async () => {
    const token = getAccessToken();
    if (!token) return;
    await fetchUser(token);
  };

  const logout = () => {
    clearAuthTokens();
    sessionStorage.removeItem("user");
    dispatch(logoutAction()); // Trigger Redux logout
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
