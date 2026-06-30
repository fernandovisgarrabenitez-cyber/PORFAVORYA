import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface AuthUser {
  username: string;
  token: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (username: string, token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "trig_auth_token";

function validateToken(token: string): { username: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload?.username || typeof payload.username !== "string") return null;
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return { username: payload.username };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { token, username } = JSON.parse(stored);
        if (typeof token === "string" && typeof username === "string") {
          const valid = validateToken(token);
          if (valid) {
            setUser({ token, username: valid.username });
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setIsLoading(false);
  }, []);

  function login(username: string, token: string) {
    const data = { token, username };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setUser(data);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
