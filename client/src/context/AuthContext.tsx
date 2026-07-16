import { useEffect, useState } from "react";
import { AuthContext } from "./auth-context";
import { logError } from "../utils/log";
import Loader from "../pages/Loader";

interface UserType {
  user_id: number;
  username: string;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/auth/me`, {
          credentials: "include",
        });
        const result = await response.json();
        if (result.user) {
          setUser(result.user as UserType);
        }
      } catch (error) {
        logError("Failed to check auth status:", error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [BACKEND_URL]);

  const login = (user: UserType) => {
    setUser(user);
  };

  const logout = () => {
    setUser(null);
  };

  if (loading) return <Loader />;

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
