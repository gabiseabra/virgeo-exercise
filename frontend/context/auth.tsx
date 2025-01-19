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
 * @param Component    Component to render when authenticated
 * @param Loading      Component to render while loading
 * @param Unauthorized Component to render when unauthorized. Defaults to redirecting to /login
 */
export const withAuth = <Props extends object,>(
  Component: React.ComponentType<Props>,
  Loading: React.ComponentType = DefaultLoading,
  Unauthorized: React.ComponentType = DefaultUnauthorized,
) => (props: Props) => {
  const { data, loading } = useAuth();
  if (loading) return <Loading />;
  if (!data) return <Unauthorized />;
  return <Component {...props} />;
}

function DefaultLoading() {
  return <div>Loading...</div>;
}

function DefaultUnauthorized() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/login');
  }, []);
  return null;
}
