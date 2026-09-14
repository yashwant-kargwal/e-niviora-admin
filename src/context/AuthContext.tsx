import { createContext, useEffect, useState, type ReactNode } from "react";

import { authService } from "@/services/auth.service";
import type { LoginDto, User } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (payload: LoginDto) => Promise<User>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  /**
   * Check existing login when app starts.
   */
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("accessTokenAdmin");

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await authService.me();

        setUser(currentUser);
      } catch (error) {
        console.error("Auth initialization failed:", error);

        localStorage.removeItem("accessTokenAdmin");
        localStorage.removeItem("refreshTokenAdmin");

        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login
   */
  const login = async (payload: LoginDto) => {
    const result = await authService.login(payload);

    localStorage.setItem("accessTokenAdmin", result.accessToken);

    if (result.refreshToken) {
      localStorage.setItem("refreshTokenAdmin", result.refreshToken);
    }

    /**
     * Always get current user from /auth/me.
     */
    const currentUser = await authService.me();

    /**
     * Admin panel should only allow ADMIN.
     */
    if (currentUser.role !== "ADMIN") {
      localStorage.removeItem("accessTokenAdmin");
      localStorage.removeItem("refreshTokenAdmin");

      throw new Error("You are not authorized to access the admin panel.");
    }

    setUser(currentUser);

    return currentUser;
  };

  /**
   * Logout
   */
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      localStorage.removeItem("accessTokenAdmin");
      localStorage.removeItem("refreshTokenAdmin");

      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
