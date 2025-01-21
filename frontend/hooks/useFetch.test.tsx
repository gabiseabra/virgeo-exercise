import { act, renderHook, mockFetch } from '@/test/utils'
import { AuthContext, AuthContextType } from '@/context/auth'
import { ApiError, useFetch } from './useFetch'

describe('useFetch', () => {
  it('should start with empty state', () => {
    const { result } = renderHook(() => useFetch({ method: 'GET', url: '/test' }))
    const [response] = result.current
    expect(response).toEqual({ loading: false })
  })

  it('should call fetch', async () => {
    const fetchMock = mockFetch()
    fetchMock.get('http://localhost:3000/test', {
      status: 200,
      body: {},
    })
    const { result } = renderHook(() => useFetch({ method: 'GET', url: '/test' }))
    const [, fetch] = result.current
    await act(() => fetch())
    expect(fetchMock).toHaveFetched('http://localhost:3000/test', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
  })

  it('should return the result JSON if the status is ok', async () => {
    const fetchMock = mockFetch()
    fetchMock.get('http://localhost:3000/test', {
      status: 200,
      body: { test: 'test' },
    })
    const { result } = renderHook(() => useFetch({ method: 'GET', url: '/test' }))
    const [, fetch] = result.current
    const data = await act(() => fetch())
    expect(data).toEqual({ test: 'test' })
    const [response] = result.current
    expect(response).toEqual({ loading: false, data: { test: 'test' } })
  })

  it('should throw an error if the status is not ok', async () => {
    const fetchMock = mockFetch()
    fetchMock.get('http://localhost:3000/test', {
      status: 400,
      body: { error: 'error' },
    })
    const { result } = renderHook(() => useFetch({ method: 'GET', url: '/test' }))
    const [, fetch] = result.current
    const error = await act(async () => {
      try {
        await fetch()
      }
      catch (error) {
        return error
      }
    })
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).code).toEqual(400)
    expect((error as ApiError).message).toEqual('error')
    const [response] = result.current
    expect(response).toEqual({ loading: false, error })
  })

  it('should include Content-Type header if a body is provided', async () => {
    const fetchMock = mockFetch()
    fetchMock.post('http://localhost:3000/test', {
      status: 200,
      body: {},
    })
    const { result } = renderHook(() => useFetch<object, { test: string }>({ method: 'POST', url: '/test' }))
    const [, fetch] = result.current
    await act(() => fetch({ test: 'test' }))
    expect(fetchMock).toHaveFetched('http://localhost:3000/test', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: { test: 'test' },
    })
  })

  it('should include Authorization header if the token is provided', async () => {
    const fetchMock = mockFetch()
    fetchMock.get('http://localhost:3000/test', {
      status: 200,
      body: {},
    })
    const { result } = renderHook(() => useFetch({ method: 'GET', url: '/test' }), {
      wrapper: mockAuthProvider({ data: { accessToken: 'token' } }),
    })
    const [, fetch] = result.current
    await act(() => fetch())
    expect(fetchMock).toHaveFetched('http://localhost:3000/test', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer token',
      },
    })
  })

  it('should logout if the status is 401', async () => {
    const fetchMock = mockFetch()
    fetchMock.get('http://localhost:3000/test', {
      status: 401,
      body: {},
    })
    const logout = jest.fn()
    const { result } = renderHook(() => useFetch({ method: 'GET', url: '/test' }), {
      wrapper: mockAuthProvider({ logout }),
    })
    const [, fetch] = result.current
    await act(async () => {
      try {
        await fetch()
      }
      catch (_) {}
    })
    expect(logout).toHaveBeenCalled()
  })
})

const mockAuthProvider = (ctx: Partial<AuthContextType>) =>
  function MockAuthProvider({ children }: { children: React.ReactNode }) {
    return (
      <AuthContext.Provider value={AuthContextType({ ...ctx })}>
        {children}
      </AuthContext.Provider>
    )
  }
