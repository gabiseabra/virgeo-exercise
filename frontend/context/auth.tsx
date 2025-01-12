import { ApiResponse, useFetch } from "@/hooks/useFetch";
import { createContext, useCallback, useContext, useState } from "react";

export type Credentials = {
  username: string
  password: string
}

export type AuthContext = ApiResponse<{ accessToken: string }> & {
  login(input: Credentials): Promise<void>
  logout(): void
}

export const AuthContext = createContext<AuthContext>({
  loading: false,
  async login() {},
  async logout() {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
  const [response, request] = useFetch<{ accessToken: string }, Credentials>({
    method: 'POST',
    url: '/login'
  });
  const login = useCallback(async (input: Credentials) => {
    const { accessToken } = await request(input);
    setAccessToken(accessToken);
  }, []);
  const logout = useCallback(() => {
    setAccessToken(undefined);
  }, []);
  return (
    <AuthContext.Provider value={{
      ...response,
      data: accessToken ? { accessToken } : undefined,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
