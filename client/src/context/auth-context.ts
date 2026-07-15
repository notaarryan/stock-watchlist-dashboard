import { createContext } from "react";

interface UserType {
  user_id: number;
  username: string;
}

export interface AuthContextType {
  user: UserType | null;
  login: (user: { user_id: number; username: string }) => void;
  logout: () => void;
  loading: true | false;
}

export const AuthContext = createContext<AuthContextType | null>(null);
