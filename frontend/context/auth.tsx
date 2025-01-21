import Redirect from '@/components/Redirect'
import { ApiResponse, useFetch } from '@/hooks/useFetch'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { createContext, useCallback, useContext } from 'react'

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
})

export const AuthContext = createContext<AuthContextType>(AuthContextType({}))

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [{ accessToken }, setAccessToken] = useLocalStorage('ACCESS_TOKEN', { })
  const [response, request] = useFetch<{ accessToken: string }, Credentials>({
    method: 'POST',
    url: '/login',
  })
  const login = useCallback(async (input: Credentials) => {
    const { accessToken } = await request(input)
    setAccessToken({ accessToken })
  }, [request, setAccessToken])
  const logout = useCallback(() => {
    setAccessToken({ })
  }, [setAccessToken])
  return (
    <AuthContext.Provider value={{
      ...response,
      data: accessToken ? { accessToken } : undefined,
      login,
      logout,
    }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Higher order component that requires authentication.
 * @param Authorized   Component to render when authenticated
 * @param Unauthorized Component to render when unauthorized. Defaults to redirecting to /login
 * @param Loading      Component to render while loading
 */
export const withAuth = <Props extends object>(
  Authorized: React.ComponentType<Props>,
  Unauthorized: React.ComponentType<Props> = DefaultUnauthorized,
  Loading: React.ComponentType<Props> = DefaultLoading,
) => Object.assign((props: Props) => {
  const { data, loading } = useAuth()
  if (loading) return <Loading {...props} />
  if (!data) return <Unauthorized {...props} />
  return <Authorized {...props} />
}, {
  displayName: `withAuth(${Authorized.displayName || Authorized.name})`,
})

function DefaultLoading() {
  return <div>Loading...</div>
}

function DefaultUnauthorized() {
  return <Redirect to="/login" />
}
