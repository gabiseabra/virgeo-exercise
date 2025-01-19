import Redirect from "@/components/Redirect";
import { ApiResponse, useFetch } from "@/hooks/useFetch";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { createContext, useCallback, useContext, useEffect } from "react";
import { useNavigate } from "react-router";

export type Credentials = {
  username: string
  password: string
}

export type AuthContextType = ApiResponse<{ accessToken: string }> & {
  login(input: Credentials): Promise<void>
  logout(): void
}

export const AuthContextType = (options: Partial<AuthContextType>): AuthContextType => ({
  loading: false,
  async login() {},
  async logout() {},
  ...options,
});

export const AuthContext = createContext<AuthContextType>(AuthContextType({}));

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [{ accessToken }, setAccessToken] = useLocalStorage('ACCESS_TOKEN', { });
  const [response, request] = useFetch<{ accessToken: string }, Credentials>({
    method: 'POST',
    url: '/login'
  });
  const login = useCallback(async (input: Credentials) => {
    const { accessToken } = await request(input);
    setAccessToken({ accessToken });
  }, []);
  const logout = useCallback(() => {
    setAccessToken({ });
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

/**
 * Higher order component that requires authentication.
 * @param Authorized   Component to render when authenticated
 * @param Unauthorized Component to render when unauthorized. Defaults to redirecting to /login
 * @param Loading      Component to render while loading
 */
export const withAuth = <Props extends object,>(
  Authorized: React.ComponentType<Props>,
  Unauthorized: React.ComponentType<Props> = DefaultUnauthorized,
  Loading: React.ComponentType<Props> = DefaultLoading,
) => (props: Props) => {
  const { data, loading } = useAuth();
  if (loading) return <Loading {...props} />;
  if (!data) return <Unauthorized {...props} />;
  return <Authorized {...props} />;
}

function DefaultLoading() {
  return <div>Loading...</div>;
}

function DefaultUnauthorized() {
  return <Redirect to="/login" />;
}
