import { act, renderHook } from "@testing-library/react";
import { AuthContext } from "@/context/auth";
import { ApiError, useFetch } from "./useFetch";

describe('useFetch', () => {
  it('should start with empty state', () => {
    const { result } = renderHook(() => useFetch({ method: 'GET', url: '/test' }));
    const [response] = result.current;
    expect(response).toEqual({ loading: false });
  });

  it('should call fetch', async () => {
    global.fetch = mockFetch(200, {});
    const { result } = renderHook(() => useFetch({ method: 'GET', url: '/test' }));
    const [, fetch] = result.current;
    await act(() => fetch());
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/test', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
  });

  it('should return the result JSON if the status is ok', async () => {
    global.fetch = mockFetch(200, { test: 'test' });
    const { result } = renderHook(() => useFetch({ method: 'GET', url: '/test' }));
    const [, fetch] = result.current;
    const data = await act(() => fetch());
    expect(data).toEqual({ test: 'test' });
    const [response] = result.current;
    expect(response).toEqual({ loading: false, data: { test: 'test' } });
  });

  it('should throw an error if the status is not ok', async () => {
    global.fetch = mockFetch(400, { error: 'error' });
    const { result } = renderHook(() => useFetch({ method: 'GET', url: '/test' }));
    const [, fetch] = result.current;
    const error = await act(async () => {
      try {
        await fetch()
      } catch (error) {
        return error;
      }
    });
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toEqual(400);
    expect((error as ApiError).message).toEqual('error');
    const [response] = result.current;
    expect(response).toEqual({ loading: false, error });
  });

  it('should include Content-Type header if a body is provided', async () => {
    global.fetch = mockFetch(200, {});
    const { result } = renderHook(() => useFetch<object, { test: string }>({ method: 'POST', url: '/test' }));
    const [, fetch] = result.current;
    await act(() => fetch({ test: 'test' }));
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/test', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: 'test' }),
    });
  });

  it('should include Authorization header if the token is provided', async () => {
    global.fetch = mockFetch(200, {});
    const { result } = renderHook(() => useFetch({ method: 'GET', url: '/test' }), {
      wrapper: mockAuthProvider({ data: { accessToken: 'token' }})
    });
    const [, fetch] = result.current;
    await act(() => fetch());
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/test', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer token',
      },
    });
  });

  it('should logout if the status is 401', async () => {
    global.fetch = mockFetch(401, {});
    const logout = jest.fn();
    const { result } = renderHook(() => useFetch({ method: 'GET', url: '/test' }), {
      wrapper: mockAuthProvider({ logout })
    });
    const [, fetch] = result.current;
    await act(async () => {
      try {
        await fetch()
      } catch(e) {}
    });
    expect(logout).toHaveBeenCalled();
  });
});

const mockFetch = (status: number, data: any) => jest.fn().mockResolvedValue({
  ok: (status >= 200 && status < 300),
  status,
  statusText: (status >= 200 && status < 300) ? 'OK' : 'Error',
  json: async () => data,
});

const mockAuthProvider = (ctx: Partial<AuthContext>) => ({ children }: { children: React.ReactNode }) => (
  <AuthContext.Provider value={{
    loading: false,
    login: jest.fn(),
    logout: jest.fn(),
    ...ctx,
  }}>
    {children}
  </AuthContext.Provider>
);
