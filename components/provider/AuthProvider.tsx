import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { http } from "../../lib/http";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

type Credentials = { email: string; password: string };

type RegisterPayload = { name: string; email: string; password: string };

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  initializing: boolean;
  signIn: (credentials: Credentials) => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const TOKEN_KEY = "auth.token";

async function loadStoredToken() {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    return null;
  }
}

async function persistToken(token: string | null) {
  if (token) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } else {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  const fetchProfile = useCallback(async (authToken: string) => {
    const profile = await http("/auth/me", { token: authToken });
    setUser(profile);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const stored = await loadStoredToken();
      if (!mounted) return;
      if (stored) {
        try {
          setToken(stored);
          await fetchProfile(stored);
        } catch (error) {
          await persistToken(null);
          setToken(null);
          setUser(null);
        }
      }
      setInitializing(false);
    })();
    return () => {
      mounted = false;
    };
  }, [fetchProfile]);

  const applySession = useCallback(async (authToken: string, authUser: AuthUser) => {
    setToken(authToken);
    setUser(authUser);
    await persistToken(authToken);
  }, []);

  const signIn = useCallback(async ({ email, password }: Credentials) => {
    const response = await http("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    await applySession(response.token, response.user);
  }, [applySession]);

  const signUp = useCallback(async ({ name, email, password }: RegisterPayload) => {
    const response = await http("/auth/register", {
      method: "POST",
      body: { name, email, password },
    });
    await applySession(response.token, response.user);
  }, [applySession]);

  const signOut = useCallback(async () => {
    setToken(null);
    setUser(null);
    await persistToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    initializing,
    signIn,
    signUp,
    signOut,
  }), [user, token, initializing, signIn, signUp, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
