import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { login as loginApi, register as registerApi, logout as logoutApi } from "@/api/auth";
import { toast } from "sonner";

interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user info is stored in localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await loginApi(email, password);
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to login");
      throw err;
    }
  };

  const register = async (fullName: string, email: string, password: string, phone: string) => {
    try {
      const data = await registerApi(fullName, email, password, phone);
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to register");
      throw err;
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
